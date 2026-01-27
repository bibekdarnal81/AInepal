// FILE: app/api/video/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getVideoMetadata } from '../status/route'
import { isVideoWatched } from '../progress/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Allowlisted upstream hosts
const ALLOWED_HOSTS = [
    'videos.openai.com',
    'openaiapi-site.azureedge.net',
    'oaidalleapiprodscus.blob.core.windows.net',
    'api.openai.com',
    'commondatastorage.googleapis.com'
]

function isAllowedHost(url: string): boolean {
    try {
        const parsed = new URL(url)
        return ALLOWED_HOSTS.some(host => 
            parsed.hostname === host || parsed.hostname.endsWith('.' + host)
        )
    } catch {
        return false
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sessionId = session.user?.email || session.user?.id || 'anonymous'
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing video id' }, { status: 400 })
        }

        // Check if video has been watched
        if (!isVideoWatched(sessionId, id)) {
            return NextResponse.json(
                { error: 'Watch the video to enable download.' },
                { status: 403 }
            )
        }

        // Get video metadata
        const metadata = getVideoMetadata(id)
        if (!metadata) {
            return NextResponse.json({ error: 'Video not found or expired' }, { status: 404 })
        }

        const outputUrl = metadata.outputUrl

        // Validate upstream host
        if (!isAllowedHost(outputUrl)) {
            console.error(`[Video-Download] Blocked non-allowlisted host: ${outputUrl}`)
            return NextResponse.json({ error: 'Invalid video source' }, { status: 400 })
        }

        // Fetch video from upstream
        const response = await fetch(outputUrl, {
            cache: 'no-store'
        })

        if (!response.ok) {
            console.error(`[Video-Download] Upstream error: ${response.status}`)
            return NextResponse.json({ error: 'Failed to fetch video' }, { status: 502 })
        }

        // Build response headers for download
        const responseHeaders = new Headers()
        responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4')
        responseHeaders.set('Content-Disposition', `attachment; filename="video-${id}.mp4"`)
        responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate')

        const contentLength = response.headers.get('Content-Length')
        if (contentLength) {
            responseHeaders.set('Content-Length', contentLength)
        }

        // Stream the response as download
        return new NextResponse(response.body, {
            status: 200,
            headers: responseHeaders
        })

    } catch (error) {
        console.error('[Video-Download] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
