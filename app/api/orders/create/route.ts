import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to make a purchase.' },
                { status: 401 }
            )
        }

        // Get request body
        const body = await request.json()
        const { itemType, itemId, itemTitle, itemSlug, amount, currency } = body

        // Validate required fields
        if (!itemType || !itemId || !itemTitle || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate item type
        if (!['service', 'course', 'project'].includes(itemType)) {
            return NextResponse.json(
                { error: 'Invalid item type' },
                { status: 400 }
            )
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                item_type: itemType,
                item_id: itemId,
                item_title: itemTitle,
                item_slug: itemSlug || null,
                amount: parseFloat(amount),
                currency: currency || 'USD',
                status: 'pending',
            })
            .select()
            .single()

        if (orderError) {
            console.error('Order creation error:', orderError)
            return NextResponse.json(
                { error: 'Failed to create order' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            order,
            message: 'Order created successfully'
        })

    } catch (error) {
        console.error('Order API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
