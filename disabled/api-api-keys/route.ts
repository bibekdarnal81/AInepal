import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptApiKey } from '@/lib/ai-encryption'

// POST - Save API key for a provider
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { provider, api_key } = body

        if (!provider || !api_key || !api_key.trim()) {
            return NextResponse.json(
                { error: 'Provider and API key are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Verify user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        // Encrypt the API key
        const { encryptedKey, iv } = encryptApiKey(api_key)

        // Check if API key already exists for this provider
        const { data: existingKey } = await supabase
            .from('ai_model_api_keys')
            .select('id')
            .eq('provider', provider)
            .single()

        if (existingKey) {
            // Update existing key
            const { error: updateError } = await supabase
                .from('ai_model_api_keys')
                .update({
                    encrypted_api_key: encryptedKey,
                    encryption_iv: iv,
                    updated_at: new Date().toISOString()
                })
                .eq('provider', provider)

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 })
            }
        } else {
            // Insert new key
            const { error: insertError } = await supabase
                .from('ai_model_api_keys')
                .insert({
                    provider,
                    encrypted_api_key: encryptedKey,
                    encryption_iv: iv
                })

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 500 })
            }
        }

        return NextResponse.json({
            success: true,
            message: `API key for ${provider} saved successfully`
        })
    } catch (error) {
        console.error('Error saving API key:', error)
        return NextResponse.json(
            { error: 'Failed to save API key' },
            { status: 500 }
        )
    }
}
