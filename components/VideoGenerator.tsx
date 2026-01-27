'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface VideoJobStatus {
    id: string
    status: 'queued' | 'processing' | 'in_progress' | 'completed' | 'failed'
    progress?: number
    error?: string
    errorType?: 'moderation_block' | 'openai_error'
    playToken?: string
    completed_at?: number
}

interface CreateJobResponse {
    id: string
    status: string
    created_at?: number
    model?: string
    seconds?: string
    size?: string
    progress?: number
    error?: string
    errorType?: 'moderation_block' | 'openai_error'
    message?: string
    details?: string
}

// Shallow equality check for status to prevent unnecessary re-renders
function hasStatusChanged(prev: VideoJobStatus | null, next: VideoJobStatus): boolean {
    if (!prev) return true
    return (
        prev.status !== next.status ||
        prev.progress !== next.progress ||
        prev.playToken !== next.playToken ||
        prev.error !== next.error ||
        prev.errorType !== next.errorType
    )
}

// 10 minute timeout for video generation
const TIMEOUT_MS = 10 * 60 * 1000
const POLL_INTERVAL_MS = 2000
const PROGRESS_THROTTLE_MS = 3000 // Send progress every 3 seconds

export default function VideoGenerator() {
    const [prompt, setPrompt] = useState('')
    const [model, setModel] = useState('sora-2')
    const [seconds, setSeconds] = useState('4')
    const [size, setSize] = useState('1280x720')
    const [status, setStatus] = useState<VideoJobStatus | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [timedOut, setTimedOut] = useState(false)
    const [savedJobId, setSavedJobId] = useState<string | null>(null)
    const [moderationBlock, setModerationBlock] = useState(false)
    
    // Watch-to-download state
    const [canDownload, setCanDownload] = useState(false)
    const [videoDuration, setVideoDuration] = useState(0)
    const [watchProgress, setWatchProgress] = useState(0)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [playToken, setPlayToken] = useState<string | null>(null)

    // Refs for polling - using refs to avoid stale closures
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const isPollingRef = useRef<boolean>(false)
    const currentJobIdRef = useRef<string | null>(null)
    const startTimeRef = useRef<number>(0)
    const modelRef = useRef<string>(model)
    const lastStatusRef = useRef<VideoJobStatus | null>(null)
    
    // Video playback refs
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const lastProgressSentRef = useRef<number>(0)

    // Derived state: are we actively generating? (simpler than separate isGenerating state)
    const isGenerating = status !== null && 
        status.status !== 'completed' && 
        status.status !== 'failed' && 
        !timedOut

    // Keep modelRef in sync
    useEffect(() => {
        modelRef.current = model
    }, [model])

    // Stop polling - guaranteed to clear interval immediately
    const stopPolling = useCallback(() => {
        console.log('[VideoGenerator] stopPolling called, clearing interval')
        // Set refs FIRST to prevent any race conditions
        isPollingRef.current = false
        currentJobIdRef.current = null
        // Then clear interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('[VideoGenerator] unmounting, stopping polling')
            stopPolling()
        }
    }, [stopPolling])

    // Send watch progress to server (throttled)
    const sendWatchProgress = useCallback(async (currentTime: number, duration: number, ended: boolean = false) => {
        if (!savedJobId) return
        
        const now = Date.now()
        // Throttle unless ended
        if (!ended && now - lastProgressSentRef.current < PROGRESS_THROTTLE_MS) {
            return
        }
        lastProgressSentRef.current = now

        try {
            const res = await fetch('/api/video/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: savedJobId,
                    secondsWatched: currentTime,
                    durationSeconds: duration,
                    ended
                })
            })
            
            if (res.ok) {
                const data = await res.json()
                if (data.downloadEnabled) {
                    setCanDownload(true)
                }
            }
        } catch (err) {
            console.error('Failed to send watch progress:', err)
        }
    }, [savedJobId])

    // Video event handlers
    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current
        if (!video) return
        
        setWatchProgress(video.currentTime)
        sendWatchProgress(video.currentTime, video.duration)
    }, [sendWatchProgress])

    const handleVideoEnded = useCallback(() => {
        const video = videoRef.current
        if (!video) return
        
        sendWatchProgress(video.duration, video.duration, true)
        setCanDownload(true)
    }, [sendWatchProgress])

    const handleLoadedMetadata = useCallback(() => {
        const video = videoRef.current
        if (video) {
            setVideoDuration(video.duration)
        }
    }, [])

    // Single poll function - does one fetch and handles result
    // Uses refs to avoid stale closure issues
    // Only updates state when values actually change to prevent jitter
    // CRITICAL: Calls stopPolling() BEFORE returning true
    const doPoll = useCallback(async (jobId: string): Promise<boolean> => {
        // Guard: check if we should even be polling
        if (!isPollingRef.current || currentJobIdRef.current !== jobId) {
            console.log(`[VideoGenerator] Poll guard: not polling or wrong jobId`)
            return true // Stop
        }

        try {
            console.log(`[VideoGenerator] Polling job ${jobId}`)
            const response = await fetch(
                `/api/video/status?id=${encodeURIComponent(jobId)}&model=${encodeURIComponent(modelRef.current)}`,
                { cache: 'no-store' }
            )
            
            // Double-check guard after async operation
            if (!isPollingRef.current || currentJobIdRef.current !== jobId) {
                console.log(`[VideoGenerator] Post-fetch guard: stale poll result`)
                return true
            }

            const data: VideoJobStatus = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get status')
            }

            // COMPLETED - stop polling IMMEDIATELY before any state updates
            if (data.status === 'completed') {
                console.log(`[VideoGenerator] Job ${jobId} COMPLETED - stopping polling NOW`)
                stopPolling() // Stop first!
                
                // Now safe to update state
                if (hasStatusChanged(lastStatusRef.current, data)) {
                    lastStatusRef.current = data
                    setStatus(data)
                    setLastUpdated(new Date())
                }
                setTimedOut(false)
                if (data.playToken) {
                    setPlayToken(data.playToken)
                    setVideoUrl(`/api/video/play?id=${encodeURIComponent(jobId)}&token=${encodeURIComponent(data.playToken)}`)
                }
                return true
            }

            // FAILED - stop polling IMMEDIATELY before any state updates
            if (data.status === 'failed') {
                console.log(`[VideoGenerator] Job ${jobId} FAILED - stopping polling NOW`)
                stopPolling() // Stop first!
                
                // Now safe to update state
                if (hasStatusChanged(lastStatusRef.current, data)) {
                    lastStatusRef.current = data
                    setStatus(data)
                    setLastUpdated(new Date())
                }
                setTimedOut(false)
                if (data.errorType === 'moderation_block') {
                    setModerationBlock(true)
                    setError(null)
                } else {
                    setError(data.error || 'Video generation failed')
                }
                return true
            }

            // Check for timeout (10 minutes)
            if (Date.now() - startTimeRef.current > TIMEOUT_MS) {
                console.log(`[VideoGenerator] Job ${jobId} TIMEOUT - stopping polling NOW`)
                stopPolling() // Stop first!
                setTimedOut(true)
                setSavedJobId(jobId)
                return true
            }

            // Still in progress - update state only if changed
            if (hasStatusChanged(lastStatusRef.current, data)) {
                console.log(`[VideoGenerator] Status changed: ${lastStatusRef.current?.status} -> ${data.status}`)
                lastStatusRef.current = data
                setStatus(data)
                setLastUpdated(new Date())
            }

            return false // Continue polling
        } catch (err) {
            console.error('[VideoGenerator] Polling error:', err)
            // Don't stop polling on transient network errors
            return false
        }
    }, [stopPolling])

    // Start polling for a job - guaranteed to only run one interval at a time
    const startPolling = useCallback((jobId: string) => {
        console.log(`[VideoGenerator] startPolling called for job ${jobId}`)
        
        // Guard: prevent multiple intervals for same job
        if (isPollingRef.current && currentJobIdRef.current === jobId) {
            console.log(`[VideoGenerator] Already polling job ${jobId}, skipping`)
            return
        }

        // Clear any existing interval FIRST
        if (pollingIntervalRef.current) {
            console.log(`[VideoGenerator] Clearing existing interval before starting new polling`)
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }

        // Set up polling state
        isPollingRef.current = true
        currentJobIdRef.current = jobId
        startTimeRef.current = Date.now()
        setTimedOut(false)
        setSavedJobId(jobId)

        // Do initial poll immediately, then set up interval
        // doPoll internally calls stopPolling when done, so we just check refs
        doPoll(jobId).then(() => {
            // After initial poll, check if we should continue
            if (!isPollingRef.current) {
                console.log(`[VideoGenerator] Initial poll stopped polling, not starting interval`)
                return
            }
            if (currentJobIdRef.current !== jobId) {
                console.log(`[VideoGenerator] Job changed, not starting interval for ${jobId}`)
                return
            }

            console.log(`[VideoGenerator] Starting interval for job ${jobId}`)
            
            // Start interval for subsequent polls
            pollingIntervalRef.current = setInterval(() => {
                // Synchronous guard check FIRST
                if (!isPollingRef.current || currentJobIdRef.current !== jobId) {
                    console.log(`[VideoGenerator] Interval guard: polling stopped, clearing interval`)
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current)
                        pollingIntervalRef.current = null
                    }
                    return
                }

                // doPoll will call stopPolling internally when complete
                doPoll(jobId)
            }, POLL_INTERVAL_MS)
        })
    }, [doPoll])

    const handleCheckAgain = () => {
        if (savedJobId) {
            setError(null)
            setTimedOut(false)
            // Reset status to queued to show as generating
            setStatus({ id: savedJobId, status: 'queued', progress: 0 })
            lastStatusRef.current = null
            startPolling(savedJobId)
        }
    }

    const handleDownload = () => {
        if (!canDownload || !savedJobId) return
        // Navigate to download endpoint
        window.location.href = `/api/video/download?id=${encodeURIComponent(savedJobId)}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!prompt.trim()) {
            setError('Please enter a prompt')
            return
        }

        // Reset state
        setError(null)
        setStatus(null)
        setVideoUrl(null)
        setTimedOut(false)
        setSavedJobId(null)
        setLastUpdated(null)
        setModerationBlock(false)
        setCanDownload(false)
        setPlayToken(null)
        setWatchProgress(0)
        setVideoDuration(0)
        lastStatusRef.current = null
        startTimeRef.current = Date.now()

        try {
            // Create video job
            const response = await fetch('/api/video/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    model,
                    seconds,
                    size
                }),
                cache: 'no-store'
            })

            const data: CreateJobResponse = await response.json()

            // Handle moderation block - do NOT start polling
            if (!response.ok) {
                if (data.errorType === 'moderation_block') {
                    setModerationBlock(true)
                    // Set status to failed so isGenerating becomes false
                    setStatus({ id: '', status: 'failed', error: 'Moderation block' })
                    return
                }
                throw new Error(data.error || data.message || 'Failed to create video job')
            }

            setStatus({
                id: data.id,
                status: data.status as VideoJobStatus['status'],
                progress: data.progress || 0
            })
            setSavedJobId(data.id)

            // Start polling for status
            startPolling(data.id)

        } catch (err) {
            // Set status to null so isGenerating becomes false
            setStatus(null)
            setError(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    const getStatusMessage = () => {
        if (!status) return null

        switch (status.status) {
            case 'queued':
                return 'Queued… waiting for capacity.'
            case 'processing':
            case 'in_progress':
                const progress = status.progress || 0
                return `Generating (720p)… ${Math.round(progress)}%`
            case 'completed':
                return 'Completed!'
            case 'failed':
                return 'Failed'
            default:
                return `Status: ${status.status}`
        }
    }

    const getStatusDisplay = () => {
        if (!status) return null

        // Determine if we're in a terminal state (completed/failed)
        const isTerminal = status.status === 'completed' || status.status === 'failed'

        return (
            // Use min-height to reserve space and prevent layout shift
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[120px]">
                <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                        status.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        status.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                        {getStatusMessage()}
                    </span>
                </div>
                {/* Progress bar - use visibility instead of conditional render to prevent jitter */}
                <div 
                    className="mt-2"
                    style={{ 
                        visibility: (!isTerminal && status.progress !== undefined) ? 'visible' : 'hidden',
                        height: '32px' // Reserve space
                    }}
                >
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress:</span>
                        <span>{Math.round(status.progress || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${status.progress || 0}%` }}
                        />
                    </div>
                </div>
                {/* Job ID - always reserve space */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 h-4">
                    {status.id ? `Job ID: ${status.id}` : '\u00A0'}
                </div>
                {/* Last updated - only show if not completed, use visibility */}
                <div 
                    className="mt-1 text-xs text-gray-400 dark:text-gray-500 h-4"
                    style={{ visibility: (!isTerminal && lastUpdated) ? 'visible' : 'hidden' }}
                >
                    {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : '\u00A0'}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Video Generator</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                        Prompt
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the video you want to generate..."
                        className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                        disabled={isGenerating}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium mb-2">
                            Model
                        </label>
                        <select
                            id="model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            disabled={isGenerating}
                        >
                            <option value="sora-2">Sora 2</option>
                            <option value="sora">Sora</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="seconds" className="block text-sm font-medium mb-2">
                            Duration
                        </label>
                        <select
                            id="seconds"
                            value={seconds}
                            onChange={(e) => setSeconds(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            disabled={isGenerating}
                        >
                            <option value="4">4 seconds</option>
                            <option value="8">8 seconds</option>
                            <option value="16">16 seconds</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="size" className="block text-sm font-medium mb-2">
                            Size
                        </label>
                        <select
                            id="size"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            disabled={isGenerating}
                        >
                            <option value="1280x720">1280x720 (Landscape 720p)</option>
                            <option value="720x1280">720x1280 (Portrait 720p)</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {getStatusMessage() || 'Generating...'}
                        </>
                    ) : (
                        'Generate Video'
                    )}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                </div>
            )}

            {moderationBlock && (
                <div className="mt-4 p-5 bg-orange-100 dark:bg-orange-900/30 border border-orange-400 dark:border-orange-700 rounded-lg">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                        Your prompt was blocked by our content moderation system
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                        Try rewording your prompt to avoid violence, sexual content, illegal activity, or hate.
                    </p>
                    <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">Safe alternatives to try:</p>
                        <div className="flex flex-col gap-2">
                            {[
                                "A peaceful sunrise over a calm ocean with gentle waves",
                                "A colorful butterfly landing on a blooming flower in a garden",
                                "A cozy cabin in snowy mountains with smoke rising from the chimney"
                            ].map((alt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setPrompt(alt)
                                        setModerationBlock(false)
                                    }}
                                    className="text-left px-3 py-2 text-sm bg-orange-200 dark:bg-orange-800/50 hover:bg-orange-300 dark:hover:bg-orange-700 rounded-lg text-orange-800 dark:text-orange-200 transition-colors"
                                >
                                    {alt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {timedOut && savedJobId && (
                <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-lg">
                    <p className="font-medium">Still processing</p>
                    <p className="text-sm mt-1">
                        Your video is still being generated. Job ID: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{savedJobId}</code>
                    </p>
                    <button
                        onClick={handleCheckAgain}
                        className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
                    >
                        Check again
                    </button>
                </div>
            )}

            {getStatusDisplay()}

            {videoUrl && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Generated Video</h3>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        autoPlay
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnded}
                        onLoadedMetadata={handleLoadedMetadata}
                        className="w-full rounded-lg shadow-lg"
                        style={{ maxHeight: '500px' }}
                    >
                        Your browser does not support the video tag.
                    </video>
                    
                    {/* Watch progress indicator */}
                    {videoDuration > 0 && !canDownload && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300 mb-2">
                                <span>Watch progress</span>
                                <span>{Math.round((watchProgress / videoDuration) * 100)}%</span>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((watchProgress / videoDuration) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Watch the video to enable download
                            </p>
                        </div>
                    )}

                    {/* Download button */}
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={handleDownload}
                            disabled={!canDownload}
                            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                                canDownload
                                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                            title={canDownload ? 'Download video' : 'Watch the video to enable download'}
                        >
                            {canDownload ? (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Video
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Watch to Download
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
