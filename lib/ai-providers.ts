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
    // Normalize common aliases/typos to avoid invalid model errors
    const normalizeOpenAIModelId = (id: string) => {
        const trimmed = id.trim()
        if (trimmed === 'gpt4o') return 'gpt-4o'
        if (trimmed === 'gpt4o-mini') return 'gpt-4o-mini'
        if (trimmed === 'gpt4') return 'gpt-4'
        return trimmed
    }

    const normalizedModelId = normalizeOpenAIModelId(modelId)

    const isO1Model = normalizedModelId.startsWith('o1-') || normalizedModelId.includes('gpt-5') // Future proofing logic or user alias

    const body: Record<string, unknown> = {
        model: normalizedModelId,
        messages,
        temperature
    }

    if (isO1Model) {
        body.max_completion_tokens = maxTokens
    } else {
        body.max_tokens = maxTokens
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
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
    const systemMessage = messages.find(m => m.role === 'system')?.content

    // Filter out system messages and sanitize for Anthropic
    // Anthropic requires:
    // 1. Alternating user/assistant roles
    // 2. Starting with user role (unless prefilling assistant)
    const rawMessages = messages.filter(m => m.role !== 'system')
    const conversationMessages: ChatMessage[] = []

    for (const msg of rawMessages) {
        if (conversationMessages.length === 0) {
            // First message must be user
            if (msg.role === 'assistant') continue
            conversationMessages.push({ ...msg })
        } else {
            const lastMsg = conversationMessages[conversationMessages.length - 1]
            if (lastMsg.role === msg.role) {
                // Merge consecutive messages of same role
                lastMsg.content += `\n\n${msg.content}`
            } else {
                conversationMessages.push({ ...msg })
            }
        }
    }

    // Ensure we have at least one message if rawMessages was not empty but filtered out (e.g. starting with assistant)
    // Actually, if conversationMessages is empty here, the API call will likely fail ("messages list must not be empty").
    // However, in our use case (route.ts), we always append the user's latest message, so we should be safe.

    const body: Record<string, unknown> = {
        model: modelId,
        max_tokens: maxTokens,
        temperature,
        messages: conversationMessages
    }

    if (systemMessage) {
        body.system = systemMessage
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Anthropic API error (${response.status}): ${error}`)
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

    const modelPath = modelId.startsWith('models/') ? modelId : `models/${modelId}`

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`,
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
 * Perplexity API client (OpenAI-compatible)
 */
export async function callPerplexity(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
        throw new Error(`Perplexity API error: ${error}`)
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
 * xAI (Grok) API client (OpenAI-compatible)
 */
export async function callXAI(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
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
        throw new Error(`xAI API error: ${error}`)
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
 * AWS Bedrock API client
 * Uses AWS Signature Version 4 for authentication
 * API Key format: "ACCESS_KEY_ID:SECRET_ACCESS_KEY:REGION" (e.g., "AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY:us-east-1")
 */
export async function callBedrock(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    // Parse credentials from apiKey (format: accessKeyId:secretAccessKey:region)
    // The region is always at the end and follows AWS region format (e.g., us-east-1, eu-west-2)
    const regionMatch = apiKey.match(/:([a-z]{2}-[a-z]+-\d+)$/)
    if (!regionMatch) {
        throw new Error('Bedrock API key must be in format: ACCESS_KEY_ID:SECRET_ACCESS_KEY:REGION (e.g., AKIA...:secret...:us-east-1). The region must be a valid AWS region like us-east-1.')
    }

    const region = regionMatch[1]
    const withoutRegion = apiKey.slice(0, apiKey.lastIndexOf(':'))
    const firstColonIndex = withoutRegion.indexOf(':')

    if (firstColonIndex === -1) {
        throw new Error('Bedrock API key must be in format: ACCESS_KEY_ID:SECRET_ACCESS_KEY:REGION. Missing secret access key.')
    }

    const accessKeyId = withoutRegion.slice(0, firstColonIndex)
    const secretAccessKey = withoutRegion.slice(firstColonIndex + 1)

    if (!accessKeyId || !secretAccessKey) {
        throw new Error('Bedrock API key must be in format: ACCESS_KEY_ID:SECRET_ACCESS_KEY:REGION. Both access key and secret key are required.')
    }

    // Determine the correct API format based on model provider
    const isAnthropicModel = modelId.includes('anthropic') || modelId.includes('claude')
    const isMistralModel = modelId.includes('mistral')
    const isMetaModel = modelId.includes('meta') || modelId.includes('llama')
    const isAmazonModel = modelId.includes('amazon') || modelId.includes('titan')
    const isCohereModel = modelId.includes('cohere')
    const isAI21Model = modelId.includes('ai21') || modelId.includes('jamba')

    // Build request body based on model type
    let requestBody: Record<string, unknown>

    if (isAnthropicModel) {
        // Anthropic Claude models on Bedrock
        const systemMessage = messages.find(m => m.role === 'system')?.content
        const conversationMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role,
                content: m.content
            }))

        requestBody = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: maxTokens,
            temperature,
            messages: conversationMessages
        }
        if (systemMessage) {
            requestBody.system = systemMessage
        }
    } else if (isMistralModel) {
        // Mistral models on Bedrock
        requestBody = {
            prompt: formatMessagesForMistral(messages),
            max_tokens: maxTokens,
            temperature
        }
    } else if (isMetaModel) {
        // Meta Llama models on Bedrock
        requestBody = {
            prompt: formatMessagesForLlama(messages),
            max_gen_len: maxTokens,
            temperature
        }
    } else if (isAmazonModel) {
        // Amazon Titan models
        requestBody = {
            inputText: formatMessagesForTitan(messages),
            textGenerationConfig: {
                maxTokenCount: maxTokens,
                temperature
            }
        }
    } else if (isCohereModel) {
        // Cohere models on Bedrock
        requestBody = {
            message: messages[messages.length - 1]?.content || '',
            chat_history: messages.slice(0, -1).map(m => ({
                role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
                message: m.content
            })),
            max_tokens: maxTokens,
            temperature
        }
    } else if (isAI21Model) {
        // AI21 Jamba models on Bedrock
        requestBody = {
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            max_tokens: maxTokens,
            temperature
        }
    } else {
        // Default format (Converse API style)
        requestBody = {
            messages: messages.map(m => ({
                role: m.role,
                content: [{ text: m.content }]
            })),
            inferenceConfig: {
                maxTokens,
                temperature
            }
        }
    }

    // Create AWS Signature Version 4
    const host = `bedrock-runtime.${region}.amazonaws.com`
    const endpoint = `https://${host}`

    // For the canonical request, the path must be URI-encoded
    // But for the actual HTTP request URL, we use the raw path (fetch will encode it)
    const rawPath = `/model/${modelId}/invoke`
    // URI-encode for canonical request (encode special chars like : to %3A)
    const canonicalUri = `/model/${encodeURIComponent(modelId)}/invoke`
    // Use raw path for the actual request URL
    const url = `${endpoint}${rawPath}`

    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)

    const service = 'bedrock'
    const contentType = 'application/json'
    const body = JSON.stringify(requestBody)

    // Calculate payload hash
    const payloadHash = await sha256(body)

    // Create canonical request - headers must be sorted and lowercase
    const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-date:${amzDate}\n`
    const signedHeaders = 'content-type;host;x-amz-date'

    const canonicalQueryString = '' // No query string for invoke

    const canonicalRequest = [
        'POST',
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n')

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    const canonicalRequestHash = await sha256(canonicalRequest)
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`

    // Calculate signature
    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service)
    const signature = await hmacHex(signingKey, stringToSign)

    // Create authorization header
    const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': contentType,
            'Host': host,
            'X-Amz-Date': amzDate,
            'Authorization': authorizationHeader
        },
        body
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`AWS Bedrock API error (${response.status}): ${error}`)
    }

    const data = await response.json()

    // Parse response based on model type
    let content = ''
    let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    let finishReason = 'stop'

    if (isAnthropicModel) {
        content = data.content?.[0]?.text || ''
        usage = {
            prompt_tokens: data.usage?.input_tokens || 0,
            completion_tokens: data.usage?.output_tokens || 0,
            total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
        finishReason = data.stop_reason || 'stop'
    } else if (isMistralModel) {
        content = data.outputs?.[0]?.text || ''
    } else if (isMetaModel) {
        content = data.generation || ''
        finishReason = data.stop_reason || 'stop'
    } else if (isAmazonModel) {
        content = data.results?.[0]?.outputText || ''
        finishReason = data.results?.[0]?.completionReason || 'stop'
    } else if (isCohereModel) {
        content = data.text || ''
        finishReason = data.finish_reason || 'stop'
    } else if (isAI21Model) {
        content = data.choices?.[0]?.message?.content || ''
        usage = data.usage || usage
    } else {
        // Converse API response
        content = data.output?.message?.content?.[0]?.text || ''
        usage = {
            prompt_tokens: data.usage?.inputTokens || 0,
            completion_tokens: data.usage?.outputTokens || 0,
            total_tokens: (data.usage?.inputTokens || 0) + (data.usage?.outputTokens || 0)
        }
        finishReason = data.stopReason || 'stop'
    }

    return {
        content,
        model: modelId,
        usage,
        finish_reason: finishReason
    }
}

// Helper functions for AWS Signature V4
async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

async function hmac(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    // Ensure we have an ArrayBuffer for crypto.subtle.importKey
    let keyBuffer: ArrayBuffer
    if (key instanceof ArrayBuffer) {
        keyBuffer = key
    } else {
        // Create a new ArrayBuffer from Uint8Array to avoid SharedArrayBuffer issues
        keyBuffer = new Uint8Array(key).buffer as ArrayBuffer
    }
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
}

async function hmacHex(key: ArrayBuffer | Uint8Array, message: string): Promise<string> {
    const result = await hmac(key, message)
    return Array.from(new Uint8Array(result))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

async function getSignatureKey(
    secretKey: string,
    dateStamp: string,
    region: string,
    service: string
): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    const kDate = await hmac(encoder.encode('AWS4' + secretKey), dateStamp)
    const kRegion = await hmac(kDate, region)
    const kService = await hmac(kRegion, service)
    const kSigning = await hmac(kService, 'aws4_request')
    return kSigning
}

// Format messages for different model types
function formatMessagesForMistral(messages: ChatMessage[]): string {
    return messages.map(m => {
        if (m.role === 'system') return `<s>[INST] ${m.content} [/INST]`
        if (m.role === 'user') return `[INST] ${m.content} [/INST]`
        return m.content
    }).join('\n')
}

function formatMessagesForLlama(messages: ChatMessage[]): string {
    let prompt = ''
    const systemMsg = messages.find(m => m.role === 'system')
    if (systemMsg) {
        prompt += `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemMsg.content}<|eot_id|>`
    }
    for (const msg of messages.filter(m => m.role !== 'system')) {
        const role = msg.role === 'assistant' ? 'assistant' : 'user'
        prompt += `<|start_header_id|>${role}<|end_header_id|>\n\n${msg.content}<|eot_id|>`
    }
    prompt += '<|start_header_id|>assistant<|end_header_id|>\n\n'
    return prompt
}

function formatMessagesForTitan(messages: ChatMessage[]): string {
    return messages.map(m => {
        const role = m.role === 'assistant' ? 'Bot' : 'User'
        return `${role}: ${m.content}`
    }).join('\n\n') + '\n\nBot:'
}

/**
 * Mistral API client (OpenAI-compatible)
 */
export async function callMistral(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
): Promise<ChatResponse> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
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
        throw new Error(`Mistral API error: ${error}`)
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
 * DigitalOcean GenAI API client (OpenAI-compatible)
 */
export async function callDigitalOcean(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000,
    endpoint?: string
): Promise<ChatResponse> {
    // Check if this is a Fal.ai image model
    // Excluding TTS/Audio models to prevent them from being routed to image logic
    if (modelId.startsWith('fal-ai/') && !modelId.includes('tts') && !modelId.includes('audio')) {
        return callDigitalOceanImage(apiKey, modelId, messages, endpoint);
    }

    // Default to the standard DigitalOcean GenAI endpoint if not provided
    // However, usually it requires a specific endpoint. If none provided, we try a common one or fail if needed.
    // For now, we'll default to a placeholder that users likely need to override/configure via model api_endpoint
    const baseUrl = endpoint || 'https://api.digitalocean.com/v1/genai/chat/completions'


    const response = await fetch(baseUrl, {
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
        console.error('[DigitalOcean] Error Response:', error)
        throw new Error(`DigitalOcean API error (${baseUrl}): ${error}`)
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
 * Handle DigitalOcean/Fal.ai Image Generation (Async)
 */
async function callDigitalOceanImage(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    endpoint?: string
): Promise<ChatResponse> {
    // 1. Extract prompt from the last user message
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || "A generated image";

    // 2. Submit Job
    // If endpoint is provided (e.g. .../v1/chat/completions), we need to derive the async-invoke URL
    // Default: https://inference.do-ai.run/v1/async-invoke
    let invokeUrl = 'https://inference.do-ai.run/v1/async-invoke';

    // If user configured a specific base, try to respect it, but usually the endpoint is fixed for DO GenAI
    // We'll stick to the known working endpoint from research: https://inference.do-ai.run/v1/async-invoke

    console.log('[DigitalOcean] Submitting Image Job:', { model: modelId, prompt });

    const submitResponse = await fetch(invokeUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model_id: modelId,
            input: {
                prompt,
                image_size: "landscape_4_3",
                num_inference_steps: 4,
                guidance_scale: 3.5,
                num_images: 1,
                enable_safety_checker: true
            }
        })
    });

    if (!submitResponse.ok) {
        const error = await submitResponse.text();
        throw new Error(`DigitalOcean Image Submit Error: ${error}`);
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.request_id || submitData.uuid;

    if (!requestId) {
        throw new Error('DigitalOcean Image: No request_id returned');
    }

    console.log('[DigitalOcean] Job Submitted. ID:', requestId);

    // 3. Poll for result
    const maxAttempts = 30; // 30 * 2s = 60s timeout
    const pollInterval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, pollInterval));

        const statusUrl = `https://inference.do-ai.run/v1/async-invoke/${requestId}`;
        const statusRes = await fetch(statusUrl, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!statusRes.ok) {
            console.warn(`[DigitalOcean] Poll failed: ${statusRes.status}`);
            continue;
        }

        const statusData = await statusRes.json();
        const status = statusData.status; // QUEUED, IN_PROGRESS, COMPLETED, FAILED

        if (status === 'COMPLETED') {
            // Extract URL
            // Format: output: { images: [ { url: ... } ] }
            const imageUrl = statusData.output?.images?.[0]?.url;
            if (imageUrl) {
                return {
                    content: `![Generated Image](${imageUrl})`,
                    model: modelId,
                    finish_reason: 'stop'
                };
            } else {
                throw new Error('DigitalOcean: Completed but no image URL found');
            }
        } else if (status === 'FAILED') {
            throw new Error(`DigitalOcean Job Failed: ${statusData.error || 'Unknown error'}`);
        }

        // If QUEUED or IN_PROGRESS, continue loop
    }

    throw new Error('DigitalOcean Image Timeout');
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
    maxTokens: number = 2000,
    options?: { apiEndpoint?: string }
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
        case 'perplexity':
            return callPerplexity(apiKey, modelId, messages, temperature, maxTokens)
        case 'xai':
            return callXAI(apiKey, modelId, messages, temperature, maxTokens)
        case 'mistral':
            return callMistral(apiKey, modelId, messages, temperature, maxTokens)
        case 'bedrock':
            return callBedrock(apiKey, modelId, messages, temperature, maxTokens)
        case 'digitalocean':
            return callDigitalOcean(apiKey, modelId, messages, temperature, maxTokens, options?.apiEndpoint)
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

/**
 * OpenAI Image Generation (DALL-E)
 */
export async function generateImageOpenAI(
    apiKey: string,
    modelId: string, // 'dall-e-3' or 'dall-e-2'
    prompt: string,
    size: string = "1024x1024",
    n: number = 1
): Promise<{ url: string }[]> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            prompt,
            n,
            size,
            quality: "standard", // standard or hd
            response_format: "url"
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI Image API error: ${error}`)
    }

    const data = await response.json()
    return data.data // Array of { url: string }
}

/**
 * OpenAI Video Generation (Sora)
 * Creates a video generation job and returns the job ID
 */
export interface VideoJobCreateResponse {
    id: string
    status: 'queued' | 'processing' | 'in_progress' | 'completed' | 'failed'
    created_at?: number
    model?: string
    error?: string
}

export interface VideoJobStatusResponse {
    id: string
    status: 'queued' | 'processing' | 'in_progress' | 'completed' | 'failed'
    progress?: number
    completed_at?: number
    error?: string
    outputUrl?: string
}

export async function createOpenAIVideoJob(
    apiKey: string,
    modelId: string,
    prompt: string,
    seconds: string = '4',
    size: string = '720x1280'
): Promise<VideoJobCreateResponse> {
    const response = await fetch('https://api.openai.com/v1/videos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            prompt,
            seconds,
            size
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI Video API error: ${error}`)
    }

    const data = await response.json()
    return {
        id: data.id,
        status: data.status,
        created_at: data.created_at,
        model: data.model
    }
}

export async function getOpenAIVideoJobStatus(
    apiKey: string,
    jobId: string
): Promise<VideoJobStatusResponse> {
    const response = await fetch(`https://api.openai.com/v1/videos/${encodeURIComponent(jobId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI Video Status API error: ${error}`)
    }

    const data = await response.json()

    let outputUrl: string | undefined

    if (data.status === 'completed') {
        if (data.output?.url) {
            outputUrl = data.output.url
        } else if (data.output?.file_id) {
            outputUrl = `https://api.openai.com/v1/files/${data.output.file_id}/content`
        }
    }

    return {
        id: data.id,
        status: data.status,
        progress: data.progress || 0,
        completed_at: data.completed_at,
        error: data.error?.message,
        outputUrl
    }
}

/**
 * Generate video using provider's API
 * Note: This is a synchronous wrapper that waits for completion
 * For async job-based approach, use createOpenAIVideoJob + getOpenAIVideoJobStatus
 */
export async function generateVideo(
    provider: string,
    apiKey: string,
    modelId: string,
    prompt: string,
    aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> {
    if (provider === 'openai') {
        const size = aspectRatio === '16:9' ? '1280x720' : '720x1280'

        // Create the job
        const job = await createOpenAIVideoJob(apiKey, modelId, prompt, '4', size)

        // Poll for completion (max 5 minutes)
        const maxAttempts = 150
        const pollInterval = 2000

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))

            const status = await getOpenAIVideoJobStatus(apiKey, job.id)

            if (status.status === 'completed' && status.outputUrl) {
                return status.outputUrl
            }

            if (status.status === 'failed') {
                throw new Error(status.error || 'Video generation failed')
            }
        }

        throw new Error('Video generation timed out')
    }

    throw new Error(`Video generation not implemented for provider: ${provider}`)
}

/**
 * OpenAI Text-to-Speech Generation
 */
export async function generateSpeechOpenAI(
    apiKey: string,
    modelId: string, // 'tts-1' or 'tts-1-hd'
    input: string,
    voice: string = 'alloy',
    speed: number = 1.0,
    response_format: string = 'mp3'
): Promise<ArrayBuffer> {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            input,
            voice,
            speed,
            response_format
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI Speech API error: ${error}`)
    }

    return await response.arrayBuffer()
}

/**
 * DigitalOcean/Fal.ai Speech Generation
 * Uses async invoke pattern (Fal.ai PlayAI/Stable Audio)
 */
export async function generateSpeechDigitalOcean(
    apiKey: string,
    modelId: string,
    input: string,
    voice: string = 'alloy'
): Promise<ArrayBuffer> {
    const invokeUrl = 'https://inference.do-ai.run/v1/async-invoke';

    console.log('[DigitalOcean] Submitting Speech Job:', { model: modelId });

    // Payload structure depends on the specific Fal.ai model (e.g. PlayAI vs Stable Audio)
    // We will assume a generic input structure or PlayAI structure for now
    // Adjust logic based on modelId if needed
    const payload: any = {
        model_id: modelId,
        input: {
            input,
            voice
        }
    };

    if (modelId.includes('stable-audio')) {
        payload.input = {
            prompt: input,
            seconds_total: 10 // Default duration
        };
    }

    const submitResponse = await fetch(invokeUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!submitResponse.ok) {
        const error = await submitResponse.text();
        throw new Error(`DigitalOcean Speech Submit Error: ${error}`);
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.request_id || submitData.uuid;

    if (!requestId) {
        throw new Error('DigitalOcean Speech: No request_id returned');
    }

    console.log('[DigitalOcean] Speech Job Submitted. ID:', requestId);

    // Poll for result
    const maxAttempts = 60; // 2 minutes (audio can take longer)
    const pollInterval = 2000;

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, pollInterval));

        const statusUrl = `https://inference.do-ai.run/v1/async-invoke/${requestId}`;
        const statusRes = await fetch(statusUrl, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        const status = statusData.status;

        if (status === 'COMPLETED') {
            // Extract URL
            // Format can vary. Usually output.audio_file.url or output.url
            const output = statusData.output;
            const audioUrl = output?.audio_file?.url || output?.url || output?.audio_url;

            if (audioUrl) {
                // Download the audio to return as buffer
                const audioRes = await fetch(audioUrl);
                if (!audioRes.ok) throw new Error('Failed to download generated audio');
                return await audioRes.arrayBuffer();
            } else {
                throw new Error('DigitalOcean: Completed but no audio URL found');
            }
        } else if (status === 'FAILED') {
            throw new Error(`DigitalOcean Speech Job Failed: ${statusData.error || 'Unknown error'}`);
        }
    }

    throw new Error('DigitalOcean Speech Timeout');
}
