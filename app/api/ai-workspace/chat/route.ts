import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/ai-encryption'
import { callAiModel } from '@/lib/ai-providers'
import type { AiProvider, ChatMessage } from '@/lib/types/ai-models'

export async function POST(request: NextRequest) {
    try {
        const { modelId, messages, temperature, maxTokens } = await request.json()

        if (!modelId || !messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Model ID and messages are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Fetch model details
        const { data: model, error: modelError } = await supabase
            .from('ai_models')
            .select('*')
            .eq('id', modelId)
            .eq('is_active', true)
            .single()

        if (modelError || !model) {
            return NextResponse.json({ error: 'Model not found or inactive' }, { status: 404 })
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

        // Call AI model
        const response = await callAiModel(
            model.provider as AiProvider,
            apiKey,
            model.model_id,
            messages as ChatMessage[],
            temperature ?? model.default_temperature,
            maxTokens ?? model.default_max_tokens
        )

        // Update last used timestamp
        await supabase
            .from('ai_model_api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('provider', model.provider)

        return NextResponse.json({
            content: response.content,
            model: response.model,
            usage: response.usage,
            finish_reason: response.finish_reason
        })
    } catch (error) {
        console.error('Error calling AI model:', error)
        return NextResponse.json(
            {
                error: 'Failed to get AI response',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
