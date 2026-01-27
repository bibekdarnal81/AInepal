import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'You must be logged in to add domains to cart' },
                { status: 401 }
            )
        }

        const { domain, price } = await request.json()

        if (!domain || !price) {
            return NextResponse.json(
                { error: 'Domain and price are required' },
                { status: 400 }
            )
        }

        // Extract TLD and domain name
        const tld = domain.substring(domain.lastIndexOf('.'))
        const domainName = domain

        // Check if domain already exists for this user
        const { data: existingDomain } = await supabase
            .from('domains')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('domain_name', domainName)
            .single()

        if (existingDomain) {
            return NextResponse.json(
                {
                    error: 'This domain is already in your cart or registered',
                    status: existingDomain.status
                },
                { status: 400 }
            )
        }

        // Add domain to cart (pending status)
        const { data: newDomain, error: insertError } = await supabase
            .from('domains')
            .insert({
                user_id: user.id,
                domain_name: domainName,
                tld: tld,
                registrar: 'cloudflare',
                price: price,
                status: 'pending',
                auto_renew: true
            })
            .select()
            .single()

        if (insertError) {
            console.error('[Cart API] Error adding domain:', insertError)
            return NextResponse.json(
                { error: 'Failed to add domain to cart' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Domain added to cart successfully',
            domain: newDomain
        })

    } catch (error) {
        console.error('[Cart API] Error:', error)
        return NextResponse.json(
            { error: 'An error occurred while adding domain to cart' },
            { status: 500 }
        )
    }
}

// GET endpoint to view cart items
export async function GET() {
    try {
        const supabase = await createClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'You must be logged in to view cart' },
                { status: 401 }
            )
        }

        // Get all pending domains for user
        const { data: cartItems, error } = await supabase
            .from('domains')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[Cart API] Error fetching cart:', error)
            return NextResponse.json(
                { error: 'Failed to fetch cart items' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            cart: cartItems,
            total: cartItems.reduce((sum, item) => sum + Number(item.price), 0)
        })

    } catch (error) {
        console.error('[Cart API] Error:', error)
        return NextResponse.json(
            { error: 'An error occurred while fetching cart' },
            { status: 500 }
        )
    }
}
