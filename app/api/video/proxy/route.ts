import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Allowlisted domains for video proxy (prevents open proxy abuse)
const ALLOWED_HOSTS = [
    'commondatastorage.googleapis.com', // Testing/sample videos
    'api.openai.com',                    // OpenAI file content endpoint
    'oaidalleapiprodscus.blob.core.windows.net', // OpenAI DALL-E/Sora CDN
    'videos.openai.com',                 // Potential OpenAI video CDN
    'cdn.openai.com',                    // Potential OpenAI CDN
    'files.oaiusercontent.com',          // OpenAI user content
]

function isAllowedHost(hostname: string): boolean {
    return ALLOWED_HOSTS.some(allowed => {
        // Exact match or subdomain match
        return hostname === allowed || hostname.endsWith(`.${allowed}`)
    })
}

export async function GET(request: NextRequest) {
    // Playback-only proxy; video generation happens in the create/status routes.
    const urlStr = request.nextUrl.searchParams.get('url')

    if (!urlStr) {
        return new NextResponse('Missing url parameter', { status: 400 })
    }

    let url: URL
    try {
        url = new URL(urlStr)
    } catch {
        return new NextResponse('Invalid URL', { status: 400 })
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return new NextResponse('Invalid URL protocol', { status: 400 })
    }

    if (!isAllowedHost(url.hostname)) {
        console.warn(`[Video-Proxy] Blocked request to disallowed host: ${url.hostname}`)
        return new NextResponse('Forbidden domain', { status: 403 })
    }

    // Build upstream request headers
    const upstreamHeaders = new Headers()

    // Forward Range header for video seeking support
    const range = request.headers.get('range')
    if (range) {
        upstreamHeaders.set('Range', range)
    }

    // For OpenAI API endpoints, we need to add authorization
    if (url.hostname === 'api.openai.com') {
        const apiKey = process.env.OPENAI_API_KEY
        if (apiKey) {
            upstreamHeaders.set('Authorization', `Bearer ${apiKey}`)
        }
    }

    try {
        const response = await fetch(urlStr, {
            method: 'GET',
            headers: upstreamHeaders
        })

        if (!response.ok && response.status !== 206) {
            console.error(`[Video-Proxy] Upstream error: ${response.status}`)
            return new NextResponse('Upstream error', { status: response.status })
        }

        if (!response.body) {
            return new NextResponse('No content', { status: 404 })
        }

        // Build response headers - preserve important streaming headers
        const responseHeaders = new Headers()
        const headersToForward = [
            'Content-Type',
            'Content-Length',
            'Accept-Ranges',
            'Content-Range',
            'ETag',
            'Last-Modified',
            'Cache-Control'
        ]

        for (const key of headersToForward) {
            const value = response.headers.get(key)
            if (value) {
                responseHeaders.set(key, value)
            }
        }

        // Ensure content-type is set for video
        if (!responseHeaders.has('Content-Type')) {
            responseHeaders.set('Content-Type', 'video/mp4')
        }

        // Ensure accept-ranges is set
        if (!responseHeaders.has('Accept-Ranges')) {
            responseHeaders.set('Accept-Ranges', 'bytes')
        }

        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders,
        })
    } catch (error) {
        console.error('[Video-Proxy] Error:', error)
        return new NextResponse('Internal Proxy Error', { status: 500 })
    }
}
