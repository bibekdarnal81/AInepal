import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptApiKey, decryptApiKey } from '@/lib/ai-encryption'

// GET - Fetch all AI models or only active ones
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('active') === 'true'

        const supabase = await createClient()

        let query = supabase
            .from('ai_models')
            .select('*')
            .order('display_order', { ascending: true })

        if (activeOnly) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ models: data })
    } catch (error) {
        console.error('Error fetching AI models:', error)
        return NextResponse.json(
            { error: 'Failed to fetch AI models' },
            { status: 500 }
        )
    }
}

// POST - Create a new AI model
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            provider,
            model_name,
            display_name,
            description,
            api_endpoint,
            model_id,
            supports_streaming,
            supports_functions,
            supports_vision,
            default_temperature,
            default_max_tokens,
            default_top_p,
            price_per_1k_input,
            price_per_1k_output,
            currency,
            is_active,
            display_order,
            api_key // API key to encrypt and store
        } = body

        const supabase = await createClient()

        // Insert model
        const { data: model, error: modelError } = await supabase
            .from('ai_models')
            .insert({
                provider,
                model_name,
                display_name,
                description,
                api_endpoint,
                model_id,
                supports_streaming: supports_streaming ?? true,
                supports_functions: supports_functions ?? false,
                supports_vision: supports_vision ?? false,
                default_temperature: default_temperature ?? 0.7,
                default_max_tokens: default_max_tokens ?? 2000,
                default_top_p: default_top_p ?? 1.0,
                price_per_1k_input,
                price_per_1k_output,
                currency: currency || 'USD',
                is_active: is_active ?? false,
                display_order: display_order ?? 0,
                connection_status: 'not_tested'
            })
            .select()
            .single()

        if (modelError) {
            return NextResponse.json({ error: modelError.message }, { status: 500 })
        }

        // If API key is provided, encrypt and store it
        if (api_key && api_key.trim()) {
            const { encryptedKey, iv } = encryptApiKey(api_key)

            // Check if API key already exists for this provider
            const { data: existingKey } = await supabase
                .from('ai_model_api_keys')
                .select('id')
                .eq('provider', provider)
                .single()

            if (existingKey) {
                // Update existing key
                await supabase
                    .from('ai_model_api_keys')
                    .update({
                        encrypted_api_key: encryptedKey,
                        encryption_iv: iv,
                        updated_at: new Date().toISOString()
                    })
                    .eq('provider', provider)
            } else {
                // Insert new key
                await supabase
                    .from('ai_model_api_keys')
                    .insert({
                        provider,
                        encrypted_api_key: encryptedKey,
                        encryption_iv: iv
                    })
            }
        }

        return NextResponse.json({ model })
    } catch (error) {
        console.error('Error creating AI model:', error)
        return NextResponse.json(
            { error: 'Failed to create AI model' },
            { status: 500 }
        )
    }
}

// PUT - Update an existing AI model
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, api_key, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Update model
        const { data: model, error: modelError } = await supabase
            .from('ai_models')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (modelError) {
            return NextResponse.json({ error: modelError.message }, { status: 500 })
        }

        // If API key is provided, update it
        if (api_key && api_key.trim()) {
            const { encryptedKey, iv } = encryptApiKey(api_key)

            const { data: existingKey } = await supabase
                .from('ai_model_api_keys')
                .select('id')
                .eq('provider', model.provider)
                .single()

            if (existingKey) {
                await supabase
                    .from('ai_model_api_keys')
                    .update({
                        encrypted_api_key: encryptedKey,
                        encryption_iv: iv,
                        updated_at: new Date().toISOString()
                    })
                    .eq('provider', model.provider)
            } else {
                await supabase
                    .from('ai_model_api_keys')
                    .insert({
                        provider: model.provider,
                        encrypted_api_key: encryptedKey,
                        encryption_iv: iv
                    })
            }
        }

        return NextResponse.json({ model })
    } catch (error) {
        console.error('Error updating AI model:', error)
        return NextResponse.json(
            { error: 'Failed to update AI model' },
            { status: 500 }
        )
    }
}

// DELETE - Remove an AI model
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('ai_models')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting AI model:', error)
        return NextResponse.json(
            { error: 'Failed to delete AI model' },
            { status: 500 }
        )
    }
}
