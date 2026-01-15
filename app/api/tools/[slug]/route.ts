// Universal AI Tool Generation API
// Handles all tool generation requests with dynamic routing

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getToolBySlug } from '@/lib/tools/tool-config'
import { generatePrompt, calculateTokenCost } from '@/lib/tools/prompts'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { inputs } = await request.json()
        const resolvedParams = await params
        const toolSlug = resolvedParams.slug

        console.log('API received tool slug:', toolSlug)

        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get tool configuration
        const toolConfig = getToolBySlug(toolSlug)
        if (!toolConfig) {
            console.log('Tool not found for slug:', toolSlug)
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
        }

        console.log('Found tool:', toolConfig.name)

        // Calculate token cost
        const tokenCost = calculateTokenCost(toolConfig.id, inputs, toolConfig.baseTokenCost)

        // Check and deduct tokens
        const { data: canDeduct, error: deductError } = await supabase.rpc('deduct_tokens', {
            p_user_id: user.id,
            p_tokens: tokenCost
        })

        if (deductError || !canDeduct) {
            return NextResponse.json({
                error: 'Insufficient tokens',
                details: `This operation requires ${tokenCost} tokens.`
            }, { status: 400 })
        }

        // Generate prompt
        const prompt = generatePrompt({
            toolId: toolConfig.id,
            inputs
        })

        // Call AI model based on tool type
        let output: string

        if (toolConfig.id === 'image-generator') {
            // Special handling for image generation
            output = await generateImage(prompt, inputs)
        } else {
            // Text generation using configured AI model
            output = await generateText(prompt, supabase)
        }

        // Save to history
        await supabase.from('ai_tool_history').insert({
            user_id: user.id,
            tool_id: toolConfig.id,
            tool_name: toolConfig.name,
            input_data: inputs,
            output_data: { content: output },
            tokens_used: tokenCost,
            status: 'success'
        })

        return NextResponse.json({
            success: true,
            output,
            tokensUsed: tokenCost
        })
    } catch (error) {
        console.error('Tool generation error:', error)
        return NextResponse.json({
            error: 'Generation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// Generate text using AI model
async function generateText(prompt: string, supabase: any): Promise<string> {
    // Get an active AI model
    const { data: models } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1)

    if (!models || models.length === 0) {
        throw new Error('No active AI model configured')
    }

    const model = models[0]

    // Get API key for this provider
    const { data: apiKeyData } = await supabase
        .from('ai_model_api_keys')
        .select('*')
        .eq('provider', model.provider)
        .single()

    if (!apiKeyData) {
        throw new Error('API key not configured for this provider')
    }

    // Import AI provider functions
    const { callAiModel } = await import('@/lib/ai-providers')
    const { decryptApiKey } = await import('@/lib/ai-encryption')

    // Decrypt API key
    const apiKey = decryptApiKey(apiKeyData.encrypted_api_key, apiKeyData.encryption_iv)

    console.log('Calling AI model:', model.provider, model.model_id)

    // Construct messages array
    const messages = [
        { role: 'user', content: prompt }
    ]

    // Call AI model with correct parameter order
    const response = await callAiModel(
        model.provider,        // provider
        apiKey,                // apiKey
        model.model_id,        // modelId
        messages,              // messages
        model.default_temperature,  // temperature
        model.default_max_tokens    // maxTokens
    )

    console.log('AI response received, content length:', response.content?.length || 0)

    return response.content
}

// Generate image using AI
async function generateImage(prompt: string, inputs: Record<string, any>): Promise<string> {
    // For now, return a placeholder
    // In production, integrate with DALL-E, Stable Diffusion, or Replicate
    return JSON.stringify({
        message: 'Image generation will be integrated with your preferred image API',
        prompt,
        settings: inputs
    })
}
