// FILE: app/api/video/play/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getVideoMetadata } from '../status/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Allowlisted upstream hosts for video streaming
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

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const token = searchParams.get('token')

        if (!id || !token) {
            return NextResponse.json({ error: 'Missing id or token' }, { status: 400 })
        }

        // Validate token against stored metadata
        const metadata = getVideoMetadata(id)
        if (!metadata) {
            return NextResponse.json({ error: 'Video not found or expired' }, { status: 404 })
        }

        if (metadata.playToken !== token) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
        }

        const outputUrl = metadata.outputUrl

        // Validate upstream host
        if (!isAllowedHost(outputUrl)) {
            console.error(`[Video-Play] Blocked non-allowlisted host: ${outputUrl}`)
            return NextResponse.json({ error: 'Invalid video source' }, { status: 400 })
        }

        // Forward Range header if present
        const rangeHeader = request.headers.get('range')
        const headers: HeadersInit = {}
        if (rangeHeader) {
            headers['Range'] = rangeHeader
        }

        // Fetch video from upstream
        const response = await fetch(outputUrl, {
            headers,
            cache: 'no-store'
        })

        if (!response.ok && response.status !== 206) {
            console.error(`[Video-Play] Upstream error: ${response.status}`)
            return NextResponse.json({ error: 'Failed to fetch video' }, { status: 502 })
        }

        // Build response headers
        const responseHeaders = new Headers()
        responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4')
        responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        responseHeaders.set('Accept-Ranges', 'bytes')

        // Forward content headers
        const contentLength = response.headers.get('Content-Length')
        if (contentLength) {
            responseHeaders.set('Content-Length', contentLength)
        }

        const contentRange = response.headers.get('Content-Range')
        if (contentRange) {
            responseHeaders.set('Content-Range', contentRange)
        }

        // Stream the response
        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders
        })

    } catch (error) {
        console.error('[Video-Play] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
