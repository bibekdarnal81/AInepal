"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Video, Download, Share2, Sparkles, Settings, Play, Film, Check, ChevronDown } from "lucide-react"

interface AvailableModel {
    modelId: string
    displayName: string
    description?: string
    image?: string
}

interface VideoInterfaceProps {
    availableModels?: AvailableModel[]
}

interface VideoStatus {
    id: string
    status: 'queued' | 'processing' | 'in_progress' | 'completed' | 'failed'
    progress?: number
    error?: string
    outputUrl?: string
}

// 10 minute timeout
const TIMEOUT_MS = 10 * 60 * 1000
const POLL_INTERVAL_MS = 2000

export function VideoInterface({ availableModels = [] }: VideoInterfaceProps) {
    // Map models
    const displayModels = availableModels.map(m => ({
        id: m.modelId,
        name: m.displayName,
        description: m.description,
        image: m.image
    }))

    const [selectedModel, setSelectedModel] = useState(displayModels.length > 0 ? displayModels[0] : null)
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9')
    const [input, setInput] = useState("")
    const [generating, setGenerating] = useState(false)
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [timedOut, setTimedOut] = useState(false)
    const [savedJobId, setSavedJobId] = useState<string | null>(null)
    const [moderationBlock, setModerationBlock] = useState(false)

    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0)

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    const pollStatus = useCallback(async (jobId: string) => {
        try {
            const statusRes = await fetch(
                `/api/video/status?id=${encodeURIComponent(jobId)}&model=${encodeURIComponent(selectedModel?.id || '')}`,
                { cache: 'no-store' }
            )
            
            if (!statusRes.ok) {
                throw new Error('Failed to check status')
            }

            const statusData: VideoStatus = await statusRes.json()
            
            setVideoStatus(statusData)
            setLastUpdated(new Date())

            if (statusData.status === 'completed' && statusData.outputUrl) {
                const proxyUrl = `/api/video/proxy?url=${encodeURIComponent(statusData.outputUrl)}`
                setGeneratedVideo(proxyUrl)
                setGenerating(false)
                setTimedOut(false)
                stopPolling()
                return
            }
            
            if (statusData.status === 'failed') {
                setError(statusData.error || 'Video generation failed')
                setGenerating(false)
                setTimedOut(false)
                stopPolling()
                return
            }

            // Check for timeout (10 minutes)
            if (Date.now() - startTimeRef.current > TIMEOUT_MS) {
                stopPolling()
                setGenerating(false)
                setTimedOut(true)
                setSavedJobId(jobId)
                return
            }
        } catch (pollError: unknown) {
            const errorMessage = pollError instanceof Error ? pollError.message : 'Unknown error'
            console.error('Polling error:', pollError)
            // Don't stop polling on transient errors
        }
    }, [selectedModel?.id, stopPolling])

    const startPolling = useCallback((jobId: string) => {
        stopPolling()
        startTimeRef.current = Date.now()
        setTimedOut(false)
        setSavedJobId(jobId)

        // Initial poll
        pollStatus(jobId)

        // Start interval
        pollingRef.current = setInterval(() => {
            pollStatus(jobId)
        }, POLL_INTERVAL_MS)
    }, [pollStatus, stopPolling])

    const handleCheckAgain = () => {
        if (savedJobId) {
            setGenerating(true)
            setError(null)
            setTimedOut(false)
            startPolling(savedJobId)
        }
    }

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!input.trim()) return

        setGenerating(true)
        setGeneratedVideo(null)
        setError(null)
        setVideoStatus(null)
        setTimedOut(false)
        setSavedJobId(null)
        setLastUpdated(null)
        setModerationBlock(false)
        startTimeRef.current = Date.now()

        try {
            // 1. Create Job
            const createRes = await fetch('/api/video/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    model: selectedModel?.id,
                    aspectRatio
                })
            })

            const createData = await createRes.json()

            if (!createRes.ok) {
                // Check for moderation block
                if (createData.errorType === 'moderation_block') {
                    setModerationBlock(true)
                    setGenerating(false)
                    return
                }
                throw new Error(createData.message || 'Failed to start video generation')
            }

            const jobId = createData.id || createData.jobId

            if (!jobId) {
                throw new Error('No job ID returned from video creation')
            }

            setVideoStatus({
                id: jobId,
                status: createData.status || 'queued',
                progress: 0
            })
            setSavedJobId(jobId)

            // Start polling
            startPolling(jobId)

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate video'
            console.error('Generation error:', err)
            setError(errorMessage)
            setGenerating(false)
        }
    }

    const getStatusMessage = () => {
        if (!videoStatus) return 'Starting...'
        
        switch (videoStatus.status) {
            case 'queued':
                return 'Queued… waiting for capacity.'
            case 'processing':
            case 'in_progress':
                const progress = videoStatus.progress || 0
                return `Generating (720p)… ${Math.round(progress)}%`
            case 'completed':
                return 'Completed!'
            case 'failed':
                return 'Failed'
            default:
                return `Status: ${videoStatus.status}`
        }
    }

    const suggestions = [
        "A cinematic drone shot of a misty forest in 4K",
        "Cyberpunk street scene with neon lights and rain, seamless loop",
        "Slow motion water droplets falling on a green leaf",
        "Abstract colorful liquid mixing animation"
    ]

    return (
        <div className="flex flex-col h-full bg-background relative selection:bg-pink-500/20">
            {/* Header */}
            <div className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-lg">Video Generation</span>
                </div>

                {/* Dynamic Model Selector */}
                <div className="relative">
                    {selectedModel ? (
                        <>
                            <button
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                {selectedModel.image ? (
                                    <img src={selectedModel.image} alt="" className="w-5 h-5 object-contain" />
                                ) : (
                                    <Video className="w-4 h-4 text-pink-500" />
                                )}
                                <span>{selectedModel.name}</span>
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </button>

                            {showModelDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowModelDropdown(false)} />
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-popover border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                                        <div className="p-2 text-xs font-medium text-muted-foreground border-b border-border">Select Model</div>
                                        {displayModels.map(model => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model)
                                                    setShowModelDropdown(false)
                                                }}
                                                className={`w-full p-3 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3 ${selectedModel.id === model.id ? 'bg-secondary/50' : ''}`}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                                                    {model.image ? (
                                                        <img src={model.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg">🎬</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm flex items-center justify-between">
                                                        {model.name}
                                                        {selectedModel.id === model.id && <Check className="w-3 h-3 text-pink-500" />}
                                                    </div>
                                                    {model.description && <p className="text-xs text-muted-foreground truncate">{model.description}</p>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="px-3 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg">
                            No Models Available
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Moderation Block Message */}
                    {moderationBlock && (
                        <div className="p-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                            <p className="font-medium text-orange-800 dark:text-orange-200">
                                Your prompt was blocked by our content moderation system
                            </p>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                                Try rewording your prompt to avoid violence, sexual content, illegal activity, or hate.
                            </p>
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">Safe alternatives to try:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "A peaceful sunrise over a calm ocean with gentle waves",
                                        "A colorful butterfly landing on a blooming flower in a garden",
                                        "A cozy cabin in snowy mountains with smoke rising from the chimney"
                                    ].map((alt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInput(alt)
                                                setModerationBlock(false)
                                            }}
                                            className="text-left px-3 py-2 text-sm bg-orange-100 dark:bg-orange-800/30 hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded-lg text-orange-800 dark:text-orange-200 transition-colors"
                                        >
                                            {alt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeout Message with Check Again */}
                    {timedOut && savedJobId && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-800 dark:text-yellow-200">
                            <p className="font-medium">Still processing</p>
                            <p className="text-sm mt-1">
                                Your video is still being generated. Job ID: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded text-xs">{savedJobId}</code>
                            </p>
                            <button
                                onClick={handleCheckAgain}
                                className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
                            >
                                Check again
                            </button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-2 group focus-within:ring-2 focus-within:ring-pink-500/20 transition-all">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe the video you want to create..."
                            className="w-full bg-transparent border-none outline-none resize-none p-3 min-h-20 text-base"
                        />
                        <div className="flex items-center justify-between px-2 pb-1">
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors" title="Settings">
                                    <Settings className="w-4 h-4" />
                                </button>
                                <div className="h-4 w-px bg-border mx-1" />
                                <div className="flex bg-secondary rounded-lg p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setAspectRatio('16:9')}
                                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${aspectRatio === '16:9' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        title="Landscape (16:9)"
                                    >
                                        16:9
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAspectRatio('9:16')}
                                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${aspectRatio === '9:16' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        title="Portrait (9:16)"
                                    >
                                        9:16
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => handleGenerate()}
                                disabled={!input.trim() || generating}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${input.trim() ? "bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-500/20" : "bg-secondary text-muted-foreground"
                                    }`}
                            >
                                {generating ? (
                                    <>Generating...</>
                                ) : (
                                    <>
                                        Generate <Video className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Suggestions */}
                    {generatedVideo === null && !generating && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Inspiration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {suggestions.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(prompt)}
                                        className="text-left p-4 rounded-xl border border-border/60 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all text-sm text-foreground/80 hover:text-foreground"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results / Loading */}
                    {(generatedVideo || generating) && (
                        <div className="w-full aspect-video rounded-3xl overflow-hidden border border-border bg-black relative group shadow-2xl">
                            {generating ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/20 backdrop-blur-sm">
                                    <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                                    <p className="text-sm font-medium">{getStatusMessage()}</p>
                                    {videoStatus && videoStatus.progress !== undefined && videoStatus.status !== 'queued' && (
                                        <div className="w-48">
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${videoStatus.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {videoStatus?.id && (
                                        <p className="text-xs text-muted-foreground">
                                            Job ID: {videoStatus.id}
                                        </p>
                                    )}
                                    {lastUpdated && (
                                        <p className="text-xs text-muted-foreground">
                                            Last updated: {lastUpdated.toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Video Player */}
                                    <div className="w-full h-full min-h-[300px] bg-black flex items-center justify-center">
                                        <video
                                            key={generatedVideo} // Force re-render on new video
                                            src={generatedVideo!}
                                            controls
                                            autoPlay
                                            loop
                                            muted // Required for most browsers to autoplay
                                            playsInline
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                console.error('Video playback error', e)
                                                // If proxy fails, fallback to direct might work in some browsers, but proxy is safer for Range support.
                                                // Could implement fallback logic via state: src={useProxy ? proxyUrl : directUrl}
                                            }}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>

                                    {/* Actions Overlay */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-lg text-white transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-lg text-white transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
