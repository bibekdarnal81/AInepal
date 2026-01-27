export interface AiModel {
    id: string
    provider: string
    model_name: string
    display_name: string
    description: string | null
    api_endpoint: string | null
    model_id: string
    supports_streaming: boolean
    supports_functions: boolean
    supports_vision: boolean
    default_temperature: number
    default_max_tokens: number
    default_top_p: number
    price_per_1k_input: number | null
    price_per_1k_output: number | null
    currency: string
    is_active: boolean
    display_order: number
    created_at: string
    updated_at: string
    last_tested_at: string | null
    connection_status: string | null
}

export interface AiModelApiKey {
    id: string
    provider: string
    encrypted_api_key: string
    encryption_iv: string
    created_at: string
    updated_at: string
    last_used_at: string | null
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface ChatRequest {
    model_id: string
    messages: ChatMessage[]
    temperature?: number
    max_tokens?: number
    top_p?: number
    stream?: boolean
}

export interface ChatResponse {
    content: string
    model: string
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
    finish_reason?: string
}

export type AiProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'perplexity' | 'xai' | 'mistral' | 'meta' | 'qwen' | 'moonshot' | 'bedrock' | 'digitalocean' | 'custom'

export interface ModelCapabilities {
    streaming: boolean
    functions: boolean
    vision: boolean
}

export interface UserModelPreference {
    id: string
    user_id: string
    model_id: string
    is_active: boolean
    display_order: number
    custom_temperature?: number
    custom_max_tokens?: number
    created_at: string
    updated_at: string
    last_used_at?: string
    // Joined model data
    model?: AiModel
}

export interface MultiChatRequest {
    message: string
    model_ids: string[]
    temperature?: number
    max_tokens?: number
    user_id?: string
}

export interface ModelResponse {
    model_id: string
    model_name: string
    provider: string
    content: string
    error?: string
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
    finish_reason?: string
    response_time?: number
}

export interface MultiChatResponse {
    responses: ModelResponse[]
    timestamp: string
}
