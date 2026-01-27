import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { AIModelApiKey, AIModel, User } from '@/lib/mongodb/models'
import { decryptApiKey } from '@/lib/ai-encryption'
import { generateVideo } from '@/lib/ai-providers'
import { deductCredits } from '@/lib/credits'

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { prompt, model: modelId, aspectRatio } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        await dbConnect()

        // Check user advancedCredits
        const user = await User.findById(session.user.id)
        if (!user || (user.advancedCredits || 0) < 20) {
            return NextResponse.json({ error: 'Insufficient advanced credits', message: 'You need at least 20 advanced credits to generate videos.' }, { status: 403 })
        }

        // 1. Identify Model Provider
        // We need to find the model in DB to know its provider, OR infer from ID
        // Let's infer or fetch. Fetching is safer.
        let provider = 'openai' // Default
        const modelRecord = await AIModel.findOne({ modelId: modelId }).lean() as {
            provider: string
            disabled?: boolean
            adminMessage?: string
        } | null
        if (modelRecord) {
            provider = modelRecord.provider.toLowerCase()

            // Check if model is disabled by admin
            if (modelRecord.disabled) {
                const message = modelRecord.adminMessage || 'This model has been temporarily disabled by the administrator.'
                return NextResponse.json({ error: message, errorType: 'model_disabled' }, { status: 503 })
            }
        } else {
            // Fallback inference
            if (modelId?.includes('veo') || modelId?.includes('gemini')) provider = 'google'
        }

        console.log(`[Video-Generate] Request - Model: ${modelId} (${provider}), Prompt: ${prompt.substring(0, 50)}...`)

        // 2. Get API Key
        const keyRecord = await AIModelApiKey.findOne({ provider }).lean()
        let apiKey = ''
        if (keyRecord && keyRecord.encryptedApiKey && keyRecord.encryptionIv) {
            try {
                apiKey = decryptApiKey(keyRecord.encryptedApiKey, keyRecord.encryptionIv)
            } catch (err) {
                console.error('Failed to decrypt API key:', err)
            }
        } else {
            // Fallback env vars
            if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY || ''
            if (provider === 'google') apiKey = process.env.GEMINI_API_KEY || ''
        }

        if (!apiKey) {
            return NextResponse.json({
                error: `No API key configured for ${provider}`,
                message: `Please configure the ${provider} API key in Admin settings.`
            }, { status: 500 })
        }

        // 3. Call Real API
        let videoUrl = ''
        try {
            videoUrl = await generateVideo(provider, apiKey, modelId, prompt, aspectRatio)
        } catch (apiError: unknown) {
            const message = apiError instanceof Error ? apiError.message : 'Unknown error'
            console.error(`[Video-Generate] Real API call failed:`, apiError)
            return NextResponse.json({
                error: 'Video generation failed',
                message,
                details: 'Using real API failed. Ensure your account has video generation access (e.g., Sora/Veo is enabled).'
            }, { status: 500 })
        }

        // Deduct credits (20 credits per video)
        await deductCredits(session.user.id, 20, `Generated video with ${modelId}`, {
            model: modelId,
            videoUrl: videoUrl
        })

        return NextResponse.json({
            success: true,
            videoUrl: videoUrl,
            model: modelId
        })

    } catch (error: unknown) {
        console.error('Video generation error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error occurred'
        return NextResponse.json(
            {
                error: 'Failed to generate video',
                message
            },
            { status: 500 }
        )
    }
}
