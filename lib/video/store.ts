// In-memory stores for video data
// Note: In a serverless environment like Vercel, these in-memory stores 
// will not be shared across lambdas and will be lost on cold starts.
// Ideally, these should be replaced with Redis or Database storage.

// --- Watch Progress Store ---

interface WatchProgress {
    secondsWatched: number
    durationSeconds: number
    watched: boolean
    updatedAt: number
}

const watchProgressStore = new Map<string, WatchProgress>()

export function cleanupWatchProgress() {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000
    for (const [key, value] of watchProgressStore.entries()) {
        if (now - value.updatedAt > maxAge) {
            watchProgressStore.delete(key)
        }
    }
}

export function getWatchProgress(sessionId: string, videoId: string): WatchProgress | undefined {
    return watchProgressStore.get(`${sessionId}:${videoId}`)
}

export function isVideoWatched(sessionId: string, videoId: string): boolean {
    const progress = watchProgressStore.get(`${sessionId}:${videoId}`)
    return progress?.watched === true
}

export function updateWatchProgress(sessionId: string, videoId: string, progress: WatchProgress) {
    watchProgressStore.set(`${sessionId}:${videoId}`, progress)
}


// --- Video Metadata Store ---

interface VideoMetadata {
    outputUrl: string
    playToken: string
    createdAt: number
}

const videoStore = new Map<string, VideoMetadata>()

export function cleanupVideoStore() {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000
    for (const [key, value] of videoStore.entries()) {
        if (now - value.createdAt > maxAge) {
            videoStore.delete(key)
        }
    }
}

export function getVideoMetadata(videoId: string) {
    return videoStore.get(videoId)
}

export function saveVideoMetadata(videoId: string, metadata: VideoMetadata) {
    videoStore.set(videoId, metadata)
}
