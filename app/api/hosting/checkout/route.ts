import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'You must be logged in to checkout' },
                { status: 401 }
            )
        }

        const { planId, planName, price, storage, bandwidth } = await request.json()

        if (!planId || !planName || !price) {
            return NextResponse.json(
                { error: 'Plan ID, name, and price are required' },
                { status: 400 }
            )
        }

        // Get the plan from database if it exists, or use the provided data
        let plan_id = null

        const { data: existingPlan } = await supabase
            .from('hosting_plans')
            .select('id')
            .eq('slug', planId)
            .single()

        if (existingPlan) {
            plan_id = existingPlan.id
        }

        // Calculate billing dates
        const now = new Date()
        const nextBillingDate = new Date(now)
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

        // Create hosting order with pending status
        const { data: newOrder, error: insertError } = await supabase
            .from('hosting_orders')
            .insert({
                user_id: user.id,
                plan_id: plan_id,
                status: 'pending',
                price: price,
                billing_cycle: 'monthly',
                next_billing_date: nextBillingDate.toISOString()
            })
            .select()
            .single()

        if (insertError) {
            console.error('[Hosting Checkout API] Error creating order:', insertError)
            return NextResponse.json(
                { error: 'Failed to create hosting order' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Hosting order created successfully',
            order: newOrder
        })

    } catch (error) {
        console.error('[Hosting Checkout API] Error:', error)
        return NextResponse.json(
            { error: 'An error occurred while processing your order' },
            { status: 500 }
        )
    }
}
