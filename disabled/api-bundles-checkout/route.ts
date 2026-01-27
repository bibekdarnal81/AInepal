import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'You must be logged in to purchase a bundle' },
                { status: 401 }
            )
        }

        const { bundleId } = await request.json()

        if (!bundleId) {
            return NextResponse.json(
                { error: 'Bundle ID is required' },
                { status: 400 }
            )
        }

        // Fetch bundle details
        const { data: bundle, error: bundleError } = await supabase
            .from('bundle_offers')
            .select('*')
            .eq('id', bundleId)
            .single()

        if (bundleError || !bundle) {
            return NextResponse.json(
                { error: 'Bundle not found' },
                { status: 404 }
            )
        }

        // Calculate price
        const price = bundle.discount_percent
            ? Math.round(bundle.price / (1 - bundle.discount_percent / 100))
            : bundle.price

        // Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                item_type: 'bundle',
                item_id: bundle.id,
                item_title: bundle.name,
                item_slug: null, // Bundles might not have slugs
                amount: bundle.price, // Use the actual price the user pays
                status: 'pending',
                notes: `Bundle Purchase: ${bundle.name}`
            })
            .select()
            .single()

        if (orderError) {
            console.error('Error creating bundle order:', orderError)
            return NextResponse.json(
                { error: 'Failed to create order' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            orderId: order.id
        })

    } catch (error) {
        console.error('Bundle checkout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
