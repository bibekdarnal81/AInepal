import type { ChatMessage, ChatResponse, AiProvider } from './types/ai-models'

/**
 * OpenAI API client
 */
export async function callOpenAI(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            messages,
            temperature,
            max_tokens: maxTokens
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()

    return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        finish_reason: data.choices[0].finish_reason
    }
}

/**
 * Anthropic (Claude) API client
 */
export async function callAnthropic(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    // Anthropic expects system message separately
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: modelId,
            max_tokens: maxTokens,
            temperature,
            system: systemMessage,
            messages: conversationMessages
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Anthropic API error: ${error}`)
    }

    const data = await response.json()

    return {
        content: data.content[0].text,
        model: data.model,
        usage: {
            prompt_tokens: data.usage.input_tokens,
            completion_tokens: data.usage.output_tokens,
            total_tokens: data.usage.input_tokens + data.usage.output_tokens
        },
        finish_reason: data.stop_reason
    }
}

/**
 * Google Gemini API client
 */
export async function callGemini(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    // Convert messages to Gemini format
    const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }))

    // Add system message to the first user message if exists
    const systemMessage = messages.find(m => m.role === 'system')?.content
    if (systemMessage && contents.length > 0 && contents[0].role === 'user') {
        contents[0].parts[0].text = `${systemMessage}\n\n${contents[0].parts[0].text}`
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens
                }
            })
        }
    )

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Gemini API error: ${error}`)
    }

    const data = await response.json()

    return {
        content: data.candidates[0].content.parts[0].text,
        model: modelId,
        usage: {
            prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
            completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
            total_tokens: data.usageMetadata?.totalTokenCount || 0
        },
        finish_reason: data.candidates[0].finishReason
    }
}

/**
 * DeepSeek API client (OpenAI-compatible)
 */
export async function callDeepSeek(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            messages,
            temperature,
            max_tokens: maxTokens
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`DeepSeek API error: ${error}`)
    }

    const data = await response.json()

    return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        finish_reason: data.choices[0].finish_reason
    }
}

/**
 * Main function to call any AI provider
 */
export async function callAiModel(
    provider: AiProvider,
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    switch (provider) {
        case 'openai':
            return callOpenAI(apiKey, modelId, messages, temperature, maxTokens)
        case 'anthropic':
            return callAnthropic(apiKey, modelId, messages, temperature, maxTokens)
        case 'google':
            return callGemini(apiKey, modelId, messages, temperature, maxTokens)
        case 'deepseek':
            return callDeepSeek(apiKey, modelId, messages, temperature, maxTokens)
        default:
            throw new Error(`Unsupported provider: ${provider}`)
    }
}

/**
 * Test connection to an AI provider
 */
export async function testProviderConnection(
    provider: AiProvider,
    apiKey: string,
    modelId: string
): Promise<{ success: boolean; message: string; responseTime?: number }> {
    const startTime = Date.now()

    try {
        const testMessages: ChatMessage[] = [
            { role: 'user', content: 'Hello, respond with just "OK"' }
        ]

        await callAiModel(provider, apiKey, modelId, testMessages, 0.1, 10)

        const responseTime = Date.now() - startTime

        return {
            success: true,
            message: 'Connection successful',
            responseTime
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
