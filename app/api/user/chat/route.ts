import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { AIModel, AIModelApiKey, UserChatSession, User } from '@/lib/mongodb/models'
import { decryptApiKey } from '@/lib/ai-encryption'
import { callAiModel } from '@/lib/ai-providers'
import { deductCredits } from '@/lib/credits'
import type { AiProvider, ChatMessage } from '@/lib/types/ai-models'

// Credit costs for different features
const CREDIT_COSTS = {
    chat: 2,
    image: 5,
    video: 20,
    audio: 10
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { message, modelId, history, sessionId } = await request.json()

        if (!message || !modelId) {
            return NextResponse.json({ error: 'Message and Model ID are required' }, { status: 400 })
        }

        await dbConnect()

        // Check if user has enough advancedCredits
        const user = await User.findById(session.user.id).select('advancedCredits isSuspended').lean()
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (user.isSuspended) {
            return NextResponse.json({
                error: 'Your account has been suspended. Please contact support.',
                errorType: 'account_suspended'
            }, { status: 403 })
        }

        const advancedCredits = user.advancedCredits || 0
        if (advancedCredits < CREDIT_COSTS.chat) {
            return NextResponse.json({
                error: `Insufficient advanced credits. Chat requires ${CREDIT_COSTS.chat} credits. You have ${advancedCredits}.`,
                errorType: 'insufficient_credits'
            }, { status: 402 })
        }

        // 1. Get the Model Configuration
        let modelConfig

        if (modelId === 'default') {
            // Get first active model if 'default' is specified
            modelConfig = await AIModel.findOne({ isActive: true, disabled: { $ne: true } }).sort({ displayOrder: 1 }).lean()
        } else {
            modelConfig = await AIModel.findById(modelId).lean()
        }

        console.log('Model Config Loaded:', modelConfig ? {
            id: modelConfig._id,
            provider: modelConfig.provider,
            modelId: modelConfig.modelId,
            apiEndpoint: modelConfig.apiEndpoint,
            hasEndpoint: !!modelConfig.apiEndpoint
        } : 'null');

        if (!modelConfig || !modelConfig.isActive) {
            return NextResponse.json({ error: 'Model not found or inactive' }, { status: 404 })
        }

        // Check if model is disabled by admin
        if (modelConfig.disabled) {
            const message = modelConfig.adminMessage || 'This model has been temporarily disabled by the administrator.'
            return NextResponse.json({ error: message, errorType: 'model_disabled' }, { status: 503 })
        }

        // 2. Get the API Key for the Provider
        const apiKeyDoc = await AIModelApiKey.findOne({ provider: modelConfig.provider })
        if (!apiKeyDoc) {
            return NextResponse.json({ error: `API key not configured for provider: ${modelConfig.provider}` }, { status: 500 })
        }

        // 3. Decrypt the API Key
        let apiKey = ''
        try {
            apiKey = decryptApiKey(apiKeyDoc.encryptedApiKey, apiKeyDoc.encryptionIv)
        } catch (error) {
            console.error('Error decrypting API key:', error)
            return NextResponse.json({ error: 'Configuration error (Encryption)' }, { status: 500 })
        }

        // 4. Transform History (ensure it matches ChatMessage type)
        // Ensure system messages are preserved if any
        const apiMessages = (history as ChatMessage[]).map((msg) => ({
            role: msg.role,
            content: msg.content
        }))

        // Add System Prompt if needed (could be configurable per model later)
        // apiMessages.unshift({ role: 'system', content: 'You are a helpful AI assistant.' })

        // Add current user message
        apiMessages.push({ role: 'user', content: message })

        const response = await callAiModel(
            modelConfig.provider as AiProvider,
            apiKey,
            modelConfig.modelId,
            apiMessages,
            // Use defaults or model config if we had it for temp/tokens, but the function defaulting handles it for now if we pass undefined or rely on param order
            // Actually callAiModel has default args. To skip them to reach options, we need to pass values.
            // But wait, the previous code was:
            // callAiModel(provider, apiKey, modelId, apiMessages)
            // It relied on the defaults for temp(0.7) and maxTokens(2000).
            // I need to preserve this behavior.
            modelConfig.defaultTemperature || 0.7,
            modelConfig.defaultMaxTokens || 2000,
            { apiEndpoint: modelConfig.apiEndpoint }
        )

        // Deduct credits after successful response
        const creditResult = await deductCredits(
            session.user.id,
            CREDIT_COSTS.chat,
            `Chat with ${modelConfig.displayName}`,
            { modelId: modelConfig.modelId, provider: modelConfig.provider }
        )

        if (!creditResult.success) {
            console.error('Failed to deduct credits:', creditResult.error)
            // Still return the response but log the error
        }

        // Save to chat session if sessionId provided, or create new session
        let chatSessionId = sessionId
        try {
            if (sessionId) {
                // Add messages to existing session
                await UserChatSession.updateOne(
                    { _id: sessionId, userId: session.user.id },
                    {
                        $push: {
                            messages: {
                                $each: [
                                    { role: 'user', content: message, timestamp: new Date() },
                                    { role: 'assistant', content: response.content, modelId: modelConfig.modelId, modelName: modelConfig.displayName, timestamp: new Date() }
                                ]
                            }
                        },
                        $set: { updatedAt: new Date() }
                    }
                )
            } else {
                // Create new session with first message
                const title = message.length > 50 ? message.substring(0, 50) + '...' : message
                const newSession = await UserChatSession.create({
                    userId: session.user.id,
                    title,
                    modelId: modelConfig.modelId,
                    messages: [
                        { role: 'user', content: message, timestamp: new Date() },
                        { role: 'assistant', content: response.content, modelId: modelConfig.modelId, modelName: modelConfig.displayName, timestamp: new Date() }
                    ],
                    isActive: true
                })
                chatSessionId = newSession._id.toString()
            }
        } catch (saveError) {
            console.error('Error saving chat session:', saveError)
            // Don't fail the request if saving fails
        }

        return NextResponse.json({ response: response.content, sessionId: chatSessionId })

    } catch (error: unknown) {
        console.error('Chat API Error:', error)
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
