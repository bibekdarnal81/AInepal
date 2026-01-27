import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { AIModelApiKey, AIModel } from '@/lib/mongodb/models'
import { decryptApiKey } from '@/lib/ai-encryption'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory store for video metadata (TODO: persist to DB)
// Maps videoId -> { outputUrl, playToken, createdAt }
const videoStore = new Map<string, { outputUrl: string; playToken: string; createdAt: number }>()

// Clean up old entries (older than 24 hours)
function cleanupVideoStore() {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000
    for (const [key, value] of videoStore.entries()) {
        if (now - value.createdAt > maxAge) {
            videoStore.delete(key)
        }
    }
}

// Export for use by play/download routes
export function getVideoMetadata(videoId: string) {
    return videoStore.get(videoId)
}

interface OpenAIVideoStatusResponse {
    id: string
    status: 'queued' | 'processing' | 'in_progress' | 'completed' | 'failed'
    progress?: number
    error?: { message: string }
    completed_at?: number
    output?: {
        url?: string
        file_id?: string
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const modelId = searchParams.get('model')

        if (!id) {
            return NextResponse.json({ error: 'Video ID (id) is required' }, { status: 400 })
        }

        await dbConnect()

        // Determine provider from model (default to openai)
        const modelIdParam = modelId || 'sora-2'
        let provider = 'openai'

        const modelRecord = await AIModel.findOne({ modelId: modelIdParam }).lean()
        if (modelRecord) {
            provider = modelRecord.provider.toLowerCase()
        }

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
                message: `No API key configured for ${provider}.`
            }, { status: 500 })
        }

        // Call OpenAI Video Status API with no-store to prevent caching
        const response = await fetch(`https://api.openai.com/v1/videos/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[Video-Status] OpenAI API error (${response.status})`)
            
            // Check for moderation block in error response
            const lowerError = errorText.toLowerCase()
            const isModerationBlock = 
                lowerError.includes('moderation') ||
                lowerError.includes('blocked') ||
                lowerError.includes('policy') ||
                lowerError.includes('safety')

            if (isModerationBlock) {
                return NextResponse.json({
                    id,
                    status: 'failed',
                    errorType: 'moderation_block',
                    error: 'Your request was blocked by the moderation system.',
                    progress: 0
                }, {
                    status: 200, // Return 200 so client can parse
                    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
                })
            }

            return NextResponse.json({
                id,
                status: 'failed',
                errorType: 'openai_error',
                error: 'Failed to get video status from OpenAI.',
                progress: 0
            }, {
                status: 200,
                headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            })
        }

        const data: OpenAIVideoStatusResponse = await response.json()

        // Check if there's an error in the response body (even on 200)
        if (data.error) {
            const lowerError = (data.error.message || '').toLowerCase()
            const isModerationBlock = 
                lowerError.includes('moderation') ||
                lowerError.includes('blocked') ||
                lowerError.includes('policy') ||
                lowerError.includes('safety')

            console.log(`[Video-Status] Job ${id}: error detected - ${data.error.message}`)
            return NextResponse.json({
                id: data.id,
                status: 'failed',
                errorType: isModerationBlock ? 'moderation_block' : 'openai_error',
                error: data.error.message || 'Video generation failed',
                progress: 0
            }, {
                headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            })
        }

        console.log(`[Video-Status] Job ${id}: status=${data.status}, progress=${data.progress || 0}`)

        // Handle different statuses
        if (data.status === 'queued' || data.status === 'processing' || data.status === 'in_progress') {
            return NextResponse.json({
                id: data.id,
                status: data.status,
                progress: data.progress || 0
            }, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            })
        }

        if (data.status === 'failed') {
            return NextResponse.json({
                id: data.id,
                status: 'failed',
                errorType: 'openai_error',
                error: 'Video generation failed'
            }, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            })
        }

        if (data.status === 'completed') {
            console.log(`[Video-Status] Job ${id}: COMPLETED`)
            let outputUrl: string | undefined

            // Try to get URL from output
            if (data.output?.url) {
                outputUrl = data.output.url
            } else if (data.output?.file_id) {
                // If file_id is returned, construct URL for our proxy
                outputUrl = `https://api.openai.com/v1/files/${data.output.file_id}/content`
            }

            // Generate secure playback token and store metadata
            // Do NOT expose outputUrl to client
            let playToken: string | undefined
            if (outputUrl) {
                cleanupVideoStore()
                playToken = crypto.randomBytes(32).toString('hex')
                videoStore.set(data.id, {
                    outputUrl,
                    playToken,
                    createdAt: Date.now()
                })
            }

            return NextResponse.json({
                id: data.id,
                status: 'completed',
                completed_at: data.completed_at,
                playToken // Client uses this to fetch video via /api/video/play
            }, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            })
        }

        // Unknown status - return as-is
        return NextResponse.json({
            id: data.id,
            status: data.status,
            progress: data.progress || 0
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        })

    } catch (error: unknown) {
        console.error('Video status error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error occurred'
        return NextResponse.json(
            { error: 'Failed to get video status', message },
            { status: 500 }
        )
    }
}
