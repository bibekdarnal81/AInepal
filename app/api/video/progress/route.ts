// FILE: app/api/video/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory store for watch progress (TODO: persist to DB)
// Key: `${sessionId}:${videoId}` -> { secondsWatched, durationSeconds, watched, updatedAt }
interface WatchProgress {
    secondsWatched: number
    durationSeconds: number
    watched: boolean
    updatedAt: number
}

const watchProgressStore = new Map<string, WatchProgress>()

// Clean up old entries (older than 24 hours)
function cleanupWatchProgress() {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000
    for (const [key, value] of watchProgressStore.entries()) {
        if (now - value.updatedAt > maxAge) {
            watchProgressStore.delete(key)
        }
    }
}

// Export for use by download route
export function getWatchProgress(sessionId: string, videoId: string): WatchProgress | undefined {
    return watchProgressStore.get(`${sessionId}:${videoId}`)
}

export function isVideoWatched(sessionId: string, videoId: string): boolean {
    const progress = watchProgressStore.get(`${sessionId}:${videoId}`)
    return progress?.watched === true
}

// Watch threshold: 95% of video or ended event
const WATCH_THRESHOLD = 0.95

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sessionId = session.user?.email || session.user?.id || 'anonymous'
        const body = await request.json()
        const { id, secondsWatched, durationSeconds, ended } = body

        if (!id) {
            return NextResponse.json({ error: 'Video id is required' }, { status: 400 })
        }

        if (typeof secondsWatched !== 'number' || typeof durationSeconds !== 'number') {
            return NextResponse.json({ error: 'Invalid progress data' }, { status: 400 })
        }

        cleanupWatchProgress()

        const key = `${sessionId}:${id}`
        const existing = watchProgressStore.get(key)

        // Calculate if watched threshold is met
        const watchRatio = durationSeconds > 0 ? secondsWatched / durationSeconds : 0
        const watched = ended === true || watchRatio >= WATCH_THRESHOLD || (existing?.watched === true)

        // Update progress (only if new progress is higher)
        const newProgress: WatchProgress = {
            secondsWatched: Math.max(secondsWatched, existing?.secondsWatched || 0),
            durationSeconds,
            watched,
            updatedAt: Date.now()
        }

        watchProgressStore.set(key, newProgress)

        return NextResponse.json({
            id,
            secondsWatched: newProgress.secondsWatched,
            durationSeconds: newProgress.durationSeconds,
            watched: newProgress.watched,
            downloadEnabled: newProgress.watched
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        })

    } catch (error) {
        console.error('[Video-Progress] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET endpoint to check current watch status
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sessionId = session.user?.email || session.user?.id || 'anonymous'
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Video id is required' }, { status: 400 })
        }

        const progress = getWatchProgress(sessionId, id)

        return NextResponse.json({
            id,
            secondsWatched: progress?.secondsWatched || 0,
            durationSeconds: progress?.durationSeconds || 0,
            watched: progress?.watched || false,
            downloadEnabled: progress?.watched || false
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        })

    } catch (error) {
        console.error('[Video-Progress] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
