import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/ai-encryption'
import { testProviderConnection } from '@/lib/ai-providers'
import type { AiProvider } from '@/lib/types/ai-models'

// GET - Test connection using query parameters (for admin panel)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const provider = searchParams.get('provider')
        const modelId = searchParams.get('model_id')

        if (!provider || !modelId) {
            return NextResponse.json(
                { success: false, message: 'Provider and model_id are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get API key for provider
        const { data: keyData, error: keyError } = await supabase
            .from('ai_model_api_keys')
            .select('*')
            .eq('provider', provider)
            .single()

        if (keyError || !keyData) {
            return NextResponse.json({
                success: false,
                message: `No API key configured for ${provider}`
            })
        }

        // Decrypt API key
        const apiKey = decryptApiKey(
            keyData.encrypted_api_key,
            keyData.encryption_iv
        )

        // Test connection
        const result = await testProviderConnection(
            provider as AiProvider,
            apiKey,
            modelId
        )

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error testing connection:', error)
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { modelId } = await request.json()

        if (!modelId) {
            return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Fetch model details
        const { data: model, error: modelError } = await supabase
            .from('ai_models')
            .select('*')
            .eq('id', modelId)
            .single()

        if (modelError || !model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        // Fetch API key for the provider
        const { data: apiKeyData, error: keyError } = await supabase
            .from('ai_model_api_keys')
            .select('*')
            .eq('provider', model.provider)
            .single()

        if (keyError || !apiKeyData) {
            return NextResponse.json(
                { error: 'API key not configured for this provider' },
                { status: 400 }
            )
        }

        // Decrypt API key
        const apiKey = decryptApiKey(apiKeyData.encrypted_api_key, apiKeyData.encryption_iv)

        // Test connection
        const result = await testProviderConnection(
            model.provider as AiProvider,
            apiKey,
            model.model_id
        )

        // Update model's connection status
        await supabase
            .from('ai_models')
            .update({
                connection_status: result.success ? 'connected' : 'failed',
                last_tested_at: new Date().toISOString()
            })
            .eq('id', modelId)

        // Update API key's last used timestamp if successful
        if (result.success) {
            await supabase
                .from('ai_model_api_keys')
                .update({ last_used_at: new Date().toISOString() })
                .eq('provider', model.provider)
        }

        return NextResponse.json({
            success: result.success,
            message: result.message,
            responseTime: result.responseTime
        })
    } catch (error) {
        console.error('Error testing connection:', error)
        return NextResponse.json(
            { error: 'Failed to test connection' },
            { status: 500 }
        )
    }
}
