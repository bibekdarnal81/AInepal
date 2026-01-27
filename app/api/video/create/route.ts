import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { AIModelApiKey, AIModel, User } from '@/lib/mongodb/models'
import { decryptApiKey } from '@/lib/ai-encryption'
import { deductCredits } from '@/lib/credits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Valid 720p sizes for OpenAI Video API
const VALID_720P_SIZES = ['1280x720', '720x1280'] as const
type Video720pSize = typeof VALID_720P_SIZES[number]

// Default to landscape 720p
const DEFAULT_SIZE: Video720pSize = '1280x720'

interface OpenAIVideoCreateResponse {
    id: string
    status: string
    created_at: number
    model: string
    error?: { message: string }
}

function get720pSize(size?: string, aspectRatio?: '16:9' | '9:16'): Video720pSize {
    // If a valid 720p size is explicitly provided, use it
    if (size && VALID_720P_SIZES.includes(size as Video720pSize)) {
        return size as Video720pSize
    }

    // Determine size from aspect ratio
    if (aspectRatio === '9:16') {
        return '720x1280' // Portrait 720p
    }

    // Default to landscape 720p
    return DEFAULT_SIZE
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check user credits
        await dbConnect()
        const user = await User.findById(session.user.id)
        if (!user || user.credits < 5) {
            return NextResponse.json({ error: 'Insufficient credits', message: 'You need at least 5 credits to generate video.' }, { status: 403 })
        }

        const body = await request.json()
        const { prompt, model, seconds, size, aspectRatio } = body

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        await dbConnect()

        // Determine model and provider
        const modelId = model || 'sora-2'
        let provider = 'openai'

        const modelRecord = await AIModel.findOne({ modelId }).lean() as {
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
        }

        console.log(`[Video-Create] Request - Model: ${modelId} (${provider})`)

        // Get API Key from DB or environment
        const keyRecord = await AIModelApiKey.findOne({ provider }).lean()
        let apiKey = ''

        if (keyRecord && keyRecord.encryptedApiKey && keyRecord.encryptionIv) {
            try {
                apiKey = decryptApiKey(keyRecord.encryptedApiKey, keyRecord.encryptionIv)
            } catch (err) {
                console.error('Failed to decrypt API key:', err)
            }
        }

        // Fallback to environment variable
        if (!apiKey && provider === 'openai') {
            apiKey = process.env.OPENAI_API_KEY || ''
        }

        if (!apiKey) {
            return NextResponse.json({
                error: 'Missing API key',
                message: `No API key configured for ${provider}. Please set OPENAI_API_KEY or configure in Admin settings.`
            }, { status: 500 })
        }

        // Build request body for OpenAI Video API
        // Duration in seconds (default to 4)
        const videoSeconds = typeof seconds === 'number' ? String(seconds) : (seconds || '4')

        // Always use 720p resolution - determine orientation from size or aspectRatio
        const videoSize = get720pSize(size, aspectRatio)

        const openaiBody = {
            model: modelId,
            prompt: prompt.trim(),
            seconds: videoSeconds,
            size: videoSize
        }

        // Log request without exposing full prompt in production
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Video-Create] Creating video with size: ${videoSize}, prompt length: ${prompt.length}`)
        } else {
            console.log(`[Video-Create] Creating video with size: ${videoSize} (720p)`)
        }

        // Call OpenAI Video API with no-store to prevent caching
        const response = await fetch('https://api.openai.com/v1/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(openaiBody),
            cache: 'no-store'
        })

        if (!response.ok) {
            const errorText = await response.text()

            // Check for moderation/content policy block
            const lowerError = errorText.toLowerCase()
            const isModerationBlock =
                lowerError.includes('moderation') ||
                lowerError.includes('blocked') ||
                lowerError.includes('policy') ||
                lowerError.includes('safety')

            if (isModerationBlock) {
                console.warn(`[Video-Create] Moderation block triggered (status ${response.status})`)
                // Trim error details for safety (no prompt exposure)
                const safeDetails = errorText.length > 200 ? errorText.slice(0, 200) + '...' : errorText
                return NextResponse.json({
                    errorType: 'moderation_block',
                    message: 'Your request was blocked by the moderation system. Please reword the prompt.',
                    details: safeDetails
                }, { status: 400 })
            }

            console.error(`[Video-Create] OpenAI API error (${response.status})`)
            return NextResponse.json({
                errorType: 'openai_error',
                error: 'OpenAI Video API error',
                message: 'Video generation failed. Please try again.'
            }, { status: 502 })
        }

        const data: OpenAIVideoCreateResponse = await response.json()

        // Deduct credits on success
        await deductCredits(session.user.id, 5, `Generated video with ${modelId}`, {
            model: modelId,
            videoId: data.id,
            seconds: videoSeconds,
            size: videoSize
        })

        return NextResponse.json({
            id: data.id,
            status: data.status,
            created_at: data.created_at,
            model: data.model,
            seconds: videoSeconds,
            size: videoSize,
            progress: 0
        })

    } catch (error: unknown) {
        console.error('Video creation error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error occurred'
        return NextResponse.json(
            { error: 'Failed to create video job', message },
            { status: 500 }
        )
    }
}
