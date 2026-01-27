// Token Management API
// Handles token balance, deduction, and history

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's token balance
        const { data: tokenData, error: tokenError } = await supabase
            .from('user_tokens')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (tokenError && tokenError.code !== 'PGRST116') { // PGRST116 = no rows
            return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
        }

        // If no token record exists, create one
        if (!tokenData) {
            const { data: newTokenData, error: createError } = await supabase
                .from('user_tokens')
                .insert({ user_id: user.id, token_balance: 1000 })
                .select()
                .single()

            if (createError) {
                return NextResponse.json({ error: 'Failed to initialize tokens' }, { status: 500 })
            }

            return NextResponse.json(newTokenData)
        }

        return NextResponse.json(tokenData)
    } catch (error) {
        console.error('Token fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { action, amount } = await request.json()

        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (action === 'deduct') {
            // Call the deduct_tokens function
            const { data, error } = await supabase.rpc('deduct_tokens', {
                p_user_id: user.id,
                p_tokens: amount
            })

            if (error || !data) {
                return NextResponse.json({
                    error: 'Insufficient tokens',
                    success: false
                }, { status: 400 })
            }

            // Get updated balance
            const { data: tokenData } = await supabase
                .from('user_tokens')
                .select('*')
                .eq('user_id', user.id)
                .single()

            return NextResponse.json({ success: true, tokens: tokenData })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Token operation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
