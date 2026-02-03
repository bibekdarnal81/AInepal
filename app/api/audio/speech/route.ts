
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { AIModelApiKey, AIModel, User } from '@/lib/mongodb/models'
import { decryptApiKey } from '@/lib/ai-encryption'
import { generateSpeechOpenAI, generateSpeechDigitalOcean } from '@/lib/ai-providers'
import { deductCredits } from '@/lib/credits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { input, model, voice, speed, response_format } = body

        if (!input || typeof input !== 'string' || input.trim().length === 0) {
            return NextResponse.json({ error: 'Input text is required' }, { status: 400 })
        }

        if (input.length > 4096) {
            return NextResponse.json({ error: 'Input text exceeds 4096 characters limit' }, { status: 400 })
        }

        await dbConnect()

        // Check user advancedCredits
        const user = await User.findById(session.user.id)
        if (!user || (user.advancedCredits || 0) < 10) {
            return NextResponse.json({ error: 'Insufficient advanced credits', message: 'You need at least 10 advanced credits to generate audio.' }, { status: 403 })
        }

        // Determine model and provider
        let modelId = model || 'tts-1'
        let provider = 'openai'

        // Fetch model config to check provider
        const modelConfig = await AIModel.findOne({ modelId: modelId }).lean()
        if (modelConfig) {
            provider = modelConfig.provider
            // If the request didn't specify a model but we found one by default/ID match
            // ensure we use the config's ID
            modelId = modelConfig.modelId
        }

        // Validations for voice/speed/format could be added here or rely on OpenAI error

        // Get API Key
        // We can reuse the logic from video implementation or create a helper
        // Ideally we should have a helper for "Get API Key for Provider" since it's repeated

        // For now, repeating the logic as in other routes to ensure consistency without major refactor
        const keyRecord = await AIModelApiKey.findOne({ provider }).lean()
        let apiKey = ''

        if (keyRecord && keyRecord.encryptedApiKey && keyRecord.encryptionIv) {
            try {
                apiKey = decryptApiKey(keyRecord.encryptedApiKey, keyRecord.encryptionIv)
            } catch (err) {
                console.error('Failed to decrypt API key:', err)
            }
        }

        // Fallback to environment variable for OpenAI
        if (!apiKey && provider === 'openai') {
            apiKey = process.env.OPENAI_API_KEY || ''
        }

        if (!apiKey) {
            return NextResponse.json({
                error: 'Missing API key',
                message: `No API key configured for ${provider}. Please set API Key or configure in Admin settings.`
            }, { status: 500 })
        }

        // Generate Speech
        let audioBuffer: ArrayBuffer

        if (provider === 'digitalocean') {
            audioBuffer = await generateSpeechDigitalOcean(
                apiKey,
                modelId,
                input,
                voice
            )
        } else {
            // Default to OpenAI
            audioBuffer = await generateSpeechOpenAI(
                apiKey,
                modelId,
                input,
                voice || 'alloy',
                Number(speed) || 1.0,
                response_format || 'mp3'
            )
        }

        // Deduct credits (10 credits per audio)
        await deductCredits(session.user.id, 10, `Generated audio with ${modelId}`, {
            model: modelId
        })

        // Return audio file
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': `audio/${response_format || 'mp3'}`,
                'Content-Length': audioBuffer.byteLength.toString(),
            }
        })

    } catch (error: any) {
        console.error('Speech generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate speech', message: error.message },
            { status: 500 }
        )
    }
}
