import { NextResponse, NextRequest } from 'next/server'
import { verifyApiKey } from '@/lib/auth/verifyApiKey'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { AIModel, AIModelApiKey, User } from '@/lib/mongodb/models'
import { decryptApiKey } from '@/lib/ai-encryption'
import { callAiModel } from '@/lib/ai-providers'
import { deductCredits } from '@/lib/credits'
import type { AiProvider } from '@/lib/types/ai-models'


// Credit costs for different features
const CREDIT_COSTS = {
    chat: 2,
}

export async function GET() {
    return NextResponse.json({
        message: 'VS Code Chat API is active. Use POST method to send messages.',
        endpoint: '/api/vscode/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <token>'
        }
    })
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect()

        let userId = ''

        // 1. Try Session Auth first (for web usage if any)
        const session = await getServerSession(authOptions)
        if (session?.user?.id) {
            userId = session.user.id
        }

        // 2. If no session, try Bearer Token (for VS Code)
        if (!userId) {
            // Use the centralized verification
            const verifiedUser = await verifyApiKey(request)

            if (verifiedUser) {
                userId = verifiedUser._id.toString()
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        console.log('API Debug: Received Body:', JSON.stringify(body, null, 2))
        const { selection, language, fileName, modelId, messages } = body
        let { prompt } = body

        // Support standard 'messages' array format (e.g. OpenAI/Claude style)
        if (!prompt && messages && Array.isArray(messages) && messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage && lastMessage.content) {
                prompt = lastMessage.content
            }
        }

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        // Check if user has enough advancedCredits
        const user = await User.findById(userId).select('advancedCredits isSuspended').lean()
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
                errorType: 'insufficient_credits',
                creditsRemaining: advancedCredits
            }, { status: 402 })
        }

        // 1. Get the Model Configuration
        let modelConfig

        if (!modelId || modelId === 'default') {
            // Get first active model if 'default' or undefined
            modelConfig = await AIModel.findOne({ isActive: true, disabled: { $ne: true }, availableInVSCode: true }).sort({ displayOrder: 1 }).lean()
        } else {
            // Check if modelId is a valid ObjectId (internal ID)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(modelId)

            if (isValidObjectId) {
                modelConfig = await AIModel.findById(modelId).lean()
            }

            // If not found by ID or not an object ID, try checking the 'modelId' string field
            if (!modelConfig) {
                modelConfig = await AIModel.findOne({ modelId: modelId }).lean()
            }
        }

        if (!modelConfig || !modelConfig.isActive) {
            return NextResponse.json({ error: 'Model not found or inactive' }, { status: 404 })
        }


        if (modelConfig.availableInVSCode === false) {
            return NextResponse.json({ error: 'This model is not available in VS Code' }, { status: 403 })
        }

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

        // 4. Construct System Prompt / Messages with Context
        // Helper to determine safe code fence length
        const getFence = (content: string) => {
            const maxBackticks = (content.match(/`+/g) || []).reduce((max, match) => Math.max(max, match.length), 0)
            return '`'.repeat(Math.max(3, maxBackticks + 1))
        }

        const fence = selection ? getFence(selection) : '```'

        const systemPrompt = `You are an intelligent coding assistant integrated into VS Code.
User is working on file: ${fileName || 'Untitled'}
Language: ${language || 'text'}
${selection ? `\nSelected Code Context:\n${fence}${language}\n${selection}\n${fence}\n` : ''}
Please help the user with their request regarding this context.`

        const apiMessages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ]

        const response = await callAiModel(
            modelConfig.provider as AiProvider,
            apiKey,
            modelConfig.modelId,
            apiMessages,
            modelConfig.defaultTemperature || 0.7,
            modelConfig.defaultMaxTokens || 2000,
            { apiEndpoint: modelConfig.apiEndpoint }
        )

        // Deduct credits after successful response
        const creditResult = await deductCredits(
            userId,
            CREDIT_COSTS.chat,
            `VS Code Chat: ${fileName || 'General'}`,
            { modelId: modelConfig.modelId, provider: modelConfig.provider, platform: 'vscode' }
        )

        // Return logic that matches the user's requested contract
        return NextResponse.json({
            message: response.content,
            creditsRemaining: creditResult.newBalance ?? advancedCredits
        })

    } catch (error: unknown) {
        console.error('VS Code Chat API Error:', error)
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
