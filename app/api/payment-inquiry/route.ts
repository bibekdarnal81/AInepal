import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { inquiryType, itemName, amount, description } = body

        // Validate required fields
        if (!inquiryType || !itemName) {
            return NextResponse.json(
                { error: 'Inquiry type and item name are required' },
                { status: 400 }
            )
        }

        // Validate inquiry type
        const validTypes = ['service', 'course', 'project']
        if (!validTypes.includes(inquiryType)) {
            return NextResponse.json(
                { error: 'Invalid inquiry type' },
                { status: 400 }
            )
        }

        // Create chat message for the inquiry
        const inquiryMessage = `💰 Payment Inquiry: ${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} - ${itemName}${amount ? ` (NPR ${amount})` : ''}`

        const { data: messageData, error: messageError } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                message: inquiryMessage,
                is_admin: false,
                is_read: false
            })
            .select()
            .single()

        if (messageError) {
            console.error('Error creating chat message:', messageError)
            return NextResponse.json(
                { error: 'Failed to create inquiry message' },
                { status: 500 }
            )
        }

        // Create payment inquiry record
        const { data: inquiryData, error: inquiryError } = await supabase
            .from('payment_inquiries')
            .insert({
                user_id: user.id,
                inquiry_type: inquiryType,
                item_name: itemName,
                amount: amount || null,
                description: description || null,
                status: 'pending',
                chat_message_id: messageData.id
            })
            .select()
            .single()

        if (inquiryError) {
            console.error('Error creating payment inquiry:', inquiryError)
            return NextResponse.json(
                { error: 'Failed to create payment inquiry' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            inquiry: inquiryData,
            message: messageData
        })
    } catch (error: any) {
        console.error('Error creating payment inquiry:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create inquiry' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch user's payment inquiries
        const { data, error } = await supabase
            .from('payment_inquiries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching payment inquiries:', error)
            return NextResponse.json(
                { error: 'Failed to fetch inquiries' },
                { status: 500 }
            )
        }

        return NextResponse.json({ inquiries: data })
    } catch (error: any) {
        console.error('Error fetching payment inquiries:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch inquiries' },
            { status: 500 }
        )
    }
}
