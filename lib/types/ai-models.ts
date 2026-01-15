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

export type AiProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'

export interface ModelCapabilities {
    streaming: boolean
    functions: boolean
    vision: boolean
}
