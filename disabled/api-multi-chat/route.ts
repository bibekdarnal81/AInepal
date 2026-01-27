import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/ai-encryption'
import { callAiModel } from '@/lib/ai-providers'
import type { MultiChatRequest, ModelResponse, AiProvider } from '@/lib/types/ai-models'

// POST - Send a message to multiple AI models simultaneously
export async function POST(request: NextRequest) {
    try {
        const body: MultiChatRequest = await request.json()
        const { message, model_ids, temperature, max_tokens } = body

        if (!message || !model_ids || model_ids.length === 0) {
            return NextResponse.json(
                { error: 'Message and model_ids are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch the requested models with their details
        const { data: models, error: modelsError } = await supabase
            .from('ai_models')
            .select('*')
            .in('id', model_ids)
            .eq('is_active', true)

        if (modelsError || !models || models.length === 0) {
            return NextResponse.json(
                { error: 'No valid models found' },
                { status: 404 }
            )
        }

        // Fetch API keys for required providers
        const providers = [...new Set(models.map(m => m.provider))]
        const { data: apiKeys, error: keysError } = await supabase
            .from('ai_model_api_keys')
            .select('*')
            .in('provider', providers)

        if (keysError) {
            return NextResponse.json(
                { error: 'Failed to fetch API keys' },
                { status: 500 }
            )
        }

        // Create a map of provider -> decrypted API key
        const apiKeyMap = new Map<string, string>()
        apiKeys?.forEach(key => {
            try {
                const decryptedKey = decryptApiKey(
                    key.encrypted_api_key,
                    key.encryption_iv
                )
                apiKeyMap.set(key.provider, decryptedKey)
            } catch (error) {
                console.error(`Failed to decrypt API key for ${key.provider}:`, error)
            }
        })

        // Prepare message format
        const chatMessages = [{ role: 'user' as const, content: message }]

        // Call all models concurrently
        const modelPromises = models.map(async (model): Promise<ModelResponse> => {
            const startTime = Date.now()
            const apiKey = apiKeyMap.get(model.provider)

            if (!apiKey) {
                return {
                    model_id: model.id,
                    model_name: model.display_name,
                    provider: model.provider,
                    content: '',
                    error: `API key not configured for ${model.provider}`,
                    response_time: 0
                }
            }

            try {
                const response = await callAiModel(
                    model.provider as AiProvider,
                    apiKey,
                    model.model_id,
                    chatMessages,
                    temperature || model.default_temperature,
                    max_tokens || model.default_max_tokens
                )

                const response_time = Date.now() - startTime

                // Update last_used_at for user preference
                await supabase
                    .from('user_ai_preferences')
                    .update({ last_used_at: new Date().toISOString() })
                    .eq('user_id', user.id)
                    .eq('model_id', model.id)

                return {
                    model_id: model.id,
                    model_name: model.display_name,
                    provider: model.provider,
                    content: response.content,
                    usage: response.usage,
                    finish_reason: response.finish_reason,
                    response_time
                }
            } catch (error) {
                console.error(`Error calling ${model.display_name}:`, error)
                return {
                    model_id: model.id,
                    model_name: model.display_name,
                    provider: model.provider,
                    content: '',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    response_time: Date.now() - startTime
                }
            }
        })

        const responses = await Promise.all(modelPromises)

        return NextResponse.json({
            responses,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error in multi-chat:', error)
        return NextResponse.json(
            { error: 'Failed to process multi-chat request' },
            { status: 500 }
        )
    }
}
