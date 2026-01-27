"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Upload, Play, Pause, Download, Volume2, RotateCcw, Check, ChevronDown, Music } from "lucide-react"

interface AudioInterfaceProps {
    availableModels?: any[]
}

const VOICES = [
    { id: 'alloy', name: 'Alloy', gender: 'Neutral' },
    { id: 'echo', name: 'Echo', gender: 'Male' },
    { id: 'fable', name: 'Fable', gender: 'British' },
    { id: 'onyx', name: 'Onyx', gender: 'Male' },
    { id: 'nova', name: 'Nova', gender: 'Female' },
    { id: 'shimmer', name: 'Shimmer', gender: 'Female' }
]

const FORMATS = ['mp3', 'opus', 'aac', 'flac']

export function AudioInterface({ availableModels = [] }: AudioInterfaceProps) {
    const defaultModel = availableModels.find(m => m.provider === 'openai') || availableModels[0] || { modelId: 'tts-1', displayName: 'OpenAI TTS' }

    const [text, setText] = useState("")
    const [selectedModel, setSelectedModel] = useState<any>(defaultModel)
    const [selectedVoice, setSelectedVoice] = useState(VOICES[0])
    const [selectedFormat, setSelectedFormat] = useState('mp3')
    const [speed, setSpeed] = useState(1.0)
    const [generating, setGenerating] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [showVoiceDropdown, setShowVoiceDropdown] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handleGenerate = async () => {
        if (!text.trim()) return

        setGenerating(true)
        setAudioUrl(null)
        setIsPlaying(false)

        try {
            const response = await fetch('/api/audio/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: text,
                    model: selectedModel.modelId,
                    voice: selectedVoice.id,
                    speed: speed,
                    response_format: selectedFormat
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to generate speech')
            }

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)

        } catch (error) {
            console.error('Generation error:', error)
            // Ideally show toast or actionable error
        } finally {
            setGenerating(false)
        }
    }

    // ... existing togglePlay ...
    const togglePlay = () => {
        if (!audioRef.current || !audioUrl) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleDownload = () => {
        if (!audioUrl) return
        const a = document.createElement('a')
        a.href = audioUrl
        a.download = `speech-${Date.now()}.${selectedFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <div className="flex flex-col h-full bg-background relative selection:bg-pink-500/20">
            {/* Header */}
            <div className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-lg">Text to Speech</span>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedModel.modelId}
                        onChange={(e) => {
                            const m = availableModels.find(mod => mod.modelId === e.target.value)
                            if (m) setSelectedModel(m)
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-secondary rounded-lg border-none outline-none cursor-pointer"
                    >
                        {availableModels.map((m: any) => (
                            <option key={m.modelId} value={m.modelId}>{m.displayName}</option>
                        ))}
                        {availableModels.length === 0 && <option value="tts-1">OpenAI TTS</option>}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                <div className="max-w-3xl w-full space-y-8 mt-4 md:mt-12">

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Good morning, <span className="text-blue-500">Rusha!</span>
                        </h1>
                        <p className="text-muted-foreground">Give your text a voice.</p>
                    </div>

                    {/* Input Area */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 relative focus-within:ring-2 focus-within:ring-pink-500/20 transition-all">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter the text you want to convert to speech..."
                            className="w-full bg-transparent border-none outline-none resize-none min-h-[120px] text-base p-1"
                        />
                    </div>

                    {/* Controls Row */}
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-secondary/50 rounded-xl text-sm font-medium transition-colors">
                            <Upload className="w-4 h-4" />
                            Upload file
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 border border-border bg-card hover:bg-secondary/50 rounded-xl transition-colors">
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Settings Panel */}
                    <div className="bg-secondary/30 border border-border rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Voice settings</h3>
                            <span className="text-xs text-muted-foreground">{selectedModel.displayName}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Voice Selector */}
                            <div className="space-y-2 relative">
                                <label className="text-xs font-medium text-muted-foreground flex justify-between">
                                    Voice
                                    <button
                                        onClick={() => {
                                            // TODO: Play sample logic
                                            console.log("Play sample")
                                        }}
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        Play voice sample <Play className="w-2.5 h-2.5" />
                                    </button>
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 bg-background border border-border rounded-xl text-sm hover:border-primary/50 transition-colors"
                                    >
                                        <span>{selectedVoice.name}</span>
                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                    </button>

                                    {showVoiceDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowVoiceDropdown(false)} />
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto">
                                                {VOICES.map(voice => (
                                                    <button
                                                        key={voice.id}
                                                        onClick={() => {
                                                            setSelectedVoice(voice)
                                                            setShowVoiceDropdown(false)
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 flex items-center justify-between ${selectedVoice.id === voice.id ? 'bg-secondary/50' : ''}`}
                                                    >
                                                        <span>{voice.name}</span>
                                                        <span className="text-xs text-muted-foreground">{voice.gender}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Format Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Output Format</label>
                                <select
                                    value={selectedFormat}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer"
                                >
                                    {FORMATS.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Speed Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Speaking Speed</span>
                                <span>{speed}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.25"
                                max="4.0"
                                step="0.25"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full accent-black dark:accent-white h-1 bg-border rounded-full appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Slower</span>
                                <span>Faster</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !text.trim()}
                        className={`w-full py-3.5 rounded-xl font-medium text-white transition-all transform active:scale-[0.99] ${generating || !text.trim()
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-black dark:bg-gray-100 dark:text-black dark:hover:bg-white shadow-lg"
                            }`}
                    >
                        {generating ? "Converting..." : "Convert"}
                    </button>

                    {/* Audio Player (Visible when Audio is ready) */}
                    {audioUrl && (
                        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>

                            <div className="flex-1">
                                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-full animate-pulse" /> {/* Placeholder progress */}
                                </div>
                            </div>

                            <button
                                onClick={handleDownload}
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onEnded={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                className="hidden"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
