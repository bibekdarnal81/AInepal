import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            courseId,
            fullName,
            email,
            mobile,
            address,
            collegeName,
            paymentMethod,
            remarks
        } = await req.json()

        // 1. Validate Input
        if (!courseId || !fullName || !email || !mobile || !address) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // 2. Fetch Course Details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()

        if (courseError || !course) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            )
        }

        // 3. Authenticate User
        let userId: string | null = null
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
            userId = session.user.id
            // Update profile with fresh data if needed (optional)
            await supabase
                .from('profiles')
                .update({
                    phone: mobile,
                })
                .eq('id', userId)
        } else {
            return NextResponse.json(
                { error: 'You must be logged in to enroll.' },
                { status: 401 }
            )
        }

        // 4. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                item_type: 'course',
                item_id: course.id,
                item_title: course.title,
                item_slug: course.slug,
                amount: course.price,
                currency: course.currency || 'Rs',
                status: 'pending',
                payment_method: paymentMethod,
                mobile,
                address,
                college_name: collegeName,
                remarks
            })
            .select()
            .single()

        if (orderError) {
            console.error('Order creation error:', orderError)
            return NextResponse.json(
                { error: 'Failed to create enrollment record' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, orderId: order.id })

    } catch (error: any) {
        console.error('Enrollment error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
