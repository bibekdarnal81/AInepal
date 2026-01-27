"use client"

import React, { useState } from "react"
import { Sparkles, Monitor, Smartphone, Square, ChevronDown, Check, ImageIcon, RefreshCw, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { notify } from "@/components/ui/notify"

// Types
type AspectRatio = "16:9" | "1:1" | "9:16"
type ColorScheme = "ocean" | "sunset" | "forest" | "purple" | "monochrome" | "neon" | "pastel"

interface AIModel {
    _id: string
    displayName: string
    modelId: string
    provider: string
}

interface ThumbnailCreatorProps {
    availableModels?: AIModel[]
}

const STYLES = [
    { id: "bold_graphic", name: "Bold & Graphic", description: "High contrast, bold typography, striking visuals", icon: "✨" },
    { id: "minimalist", name: "Minimalist", description: "Clean, simple, lots of white space", icon: "🔳" },
    { id: "photorealistic", name: "Photorealistic", description: "Photo-based, natural looking", icon: "📸" },
    { id: "illustrated", name: "Illustrated", description: "Hand-drawn, artistic, creative", icon: "🎨" },
    { id: "tech_futuristic", name: "Tech/Futuristic", description: "Modern, sleek, tech-inspired", icon: "⚙️" },
]

const COLOR_SCHEMES: { id: ColorScheme; colors: string[]; name: string }[] = [
    { id: "ocean", colors: ["#22d3ee", "#0ea5e9"], name: "Ocean Breeze" }, // Cyan/Sky
    { id: "sunset", colors: ["#f97316", "#db2777"], name: "Sunset Glow" }, // Orange/Pink
    { id: "neon", colors: ["#06b6d4", "#3b82f6"], name: "Neon Nights" },   // Cyan/Blue
    { id: "forest", colors: ["#10b981", "#059669"], name: "Deep Forest" }, // Emerald
    { id: "purple", colors: ["#a855f7", "#d946ef"], name: "Purple Dream" }, // Purple/Fuchsia
    { id: "monochrome", colors: ["#374151", "#9ca3af"], name: "Monochrome" }, // Gray
    { id: "pastel", colors: ["#f0abfc", "#c084fc"], name: "Unicorn" }, // Light Pink/Purple
]

export function ThumbnailCreator({ availableModels = [] }: ThumbnailCreatorProps) {
    // State
    const [title, setTitle] = useState("")
    const [ratio, setRatio] = useState<AspectRatio>("16:9")
    const [style, setStyle] = useState(STYLES[0])
    const [colorScheme, setColorScheme] = useState<ColorScheme>("purple")

    // Initialize with first available model or null
    const [manualModelId, setManualModelId] = useState<string>("")
    const selectedModelId = manualModelId || (availableModels.length > 0 ? availableModels[0]._id : "")

    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [showStyleDropdown, setShowStyleDropdown] = useState(false)



    // Derived Placeholder Logic
    const getPlaceholder = () => {
        const currentModel = availableModels.find(m => m._id === selectedModelId)
        if (!currentModel) return "Enter a topic or title..."

        const id = currentModel.modelId.toLowerCase()
        const name = currentModel.displayName.toLowerCase()

        if (id.includes('dall') || name.includes('dall')) {
            return "Enter a detailed, descriptive scene (DALL-E works best with details)..."
        } else if (id.includes('flux') || name.includes('flux')) {
            return "Enter a creative prompt (Flux excels at artistic styles)..."
        } else if (id.includes('mj') || name.includes('midjourney')) {
            return "Enter artistic keywords and style descriptors..."
        } else if (id.includes('ultra') || name.includes('ultra')) {
            return "Enter complex scene description or specific title..."
        }

        return `Enter a prompt for ${currentModel.displayName}...`
    }



    // Handlers
    const handleGenerate = async () => {
        if (!prompt) {
            notify.error("Please enter a prompt")
            return
        }

        const currentModel = availableModels.find(m => m._id === selectedModelId)
        if (!currentModel) {
            notify.error("Please select a model")
            return
        }

        setIsGenerating(true)
        setGeneratedImage(null)

        try {
            // Construct a rich prompt with all details
            const selectedScheme = COLOR_SCHEMES.find(c => c.id === colorScheme)

            let fullPrompt = ""
            if (title) fullPrompt += `Subject/Title: "${title}". `
            if (prompt) fullPrompt += `${prompt}. `
            if (selectedScheme) fullPrompt += `Color Palette: ${selectedScheme.name} (${selectedScheme.colors.join(', ')}). `

            // Clean up whitespace
            fullPrompt = fullPrompt.trim()

            const response = await fetch('/api/image-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    model: currentModel.modelId,
                    style: style.name, // Use human-readable name for better results
                    aspectRatio: ratio,
                    imageCount: 1
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to generate image')
            }

            if (data.images && data.images.length > 0) {
                setGeneratedImage(data.images[0])
                notify.success(`Image generated successfully with ${data.model}`)
            } else {
                throw new Error('No image URL received')
            }

        } catch (error: unknown) {
            console.error('Generation failed:', error)
            const message = error instanceof Error ? error.message : "Failed to generate image. Please try again."
            notify.error(message)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="flex w-full h-full bg-background text-foreground overflow-hidden font-sans transition-colors">
            {/* Left Panel - Controls */}
            <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl h-full overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold mb-1 tracking-tight">Create Your Image</h1>
                        <p className="text-muted-foreground text-sm">Describe your vision and let AI bring it to life</p>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/90">Title or Topic</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-muted-foreground/50"
                                placeholder={getPlaceholder()}
                            />
                            <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground/60">
                                {title.length}/100
                            </div>
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/90">Aspect Ratio</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setRatio("16:9")}
                                className={cn(
                                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all",
                                    ratio === "16:9" ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400" : "border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                                )}
                            >
                                <Monitor className="w-4 h-4" /> 16:9
                            </button>
                            <button
                                onClick={() => setRatio("1:1")}
                                className={cn(
                                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all",
                                    ratio === "1:1" ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400" : "border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                                )}
                            >
                                <Square className="w-4 h-4" /> 1:1
                            </button>
                            <button
                                onClick={() => setRatio("9:16")}
                                className={cn(
                                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all",
                                    ratio === "9:16" ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400" : "border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                                )}
                            >
                                <Smartphone className="w-4 h-4" /> 9:16
                            </button>
                        </div>
                    </div>

                    {/* Thumbnail Style */}
                    <div className="space-y-3 relative">
                        <label className="text-sm font-medium text-foreground/90">Thumbnail Style</label>
                        <button
                            onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                            className="w-full flex items-center justify-between bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-pink-500 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{style.icon}</span>
                                <div>
                                    <div className="text-sm font-medium">{style.name}</div>
                                    <div className="text-xs text-muted-foreground">{style.description}</div>
                                </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {showStyleDropdown && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {STYLES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setStyle(s); setShowStyleDropdown(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors",
                                            style.id === s.id && "bg-secondary/80"
                                        )}
                                    >
                                        <span className="text-lg">{s.icon}</span>
                                        <div>
                                            <div className="text-sm font-medium">{s.name}</div>
                                            <div className="text-xs text-muted-foreground">{s.description}</div>
                                        </div>
                                        {style.id === s.id && <Check className="w-4 h-4 text-pink-500 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Color Scheme */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/90">Color Scheme</label>
                        <div className="flex gap-2 flex-wrap">
                            {COLOR_SCHEMES.map((scheme) => (
                                <button
                                    key={scheme.id}
                                    onClick={() => setColorScheme(scheme.id)}
                                    className={cn(
                                        "w-10 h-10 rounded-lg flex overflow-hidden ring-2 ring-offset-2 ring-offset-background transition-all",
                                        colorScheme === scheme.id ? "ring-foreground" : "ring-transparent hover:ring-muted-foreground/30"
                                    )}
                                    title={scheme.name}
                                >
                                    <div className="w-1/2 h-full" style={{ backgroundColor: scheme.colors[0] }} />
                                    <div className="w-1/2 h-full" style={{ backgroundColor: scheme.colors[1] }} />
                                </button>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Selected: <span className="text-foreground">{COLOR_SCHEMES.find(c => c.id === colorScheme)?.name}</span>
                        </div>
                    </div>

                    {/* Model */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/90">Model</label>
                        <select
                            value={selectedModelId}
                            onChange={(e) => setManualModelId(e.target.value)}
                            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-pink-500 appearance-none text-foreground"
                            disabled={availableModels.length === 0}
                        >
                            {availableModels.length > 0 ? (
                                availableModels.map(m => (
                                    <option key={m._id} value={m._id}>
                                        {m.displayName}
                                    </option>
                                ))
                            ) : (
                                <option value="">No models available</option>
                            )}
                        </select>
                        {availableModels.length === 0 && (
                            <p className="text-xs text-red-400">No image generation models found in database.</p>
                        )}
                    </div>

                    {/* Additional Prompts */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/90">Additional Prompts <span className="text-muted-foreground font-normal">(optional)</span></label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-muted-foreground/50"
                            placeholder="Add any specific elements, mood, or style preferences..."
                        />
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || availableModels.length === 0}
                        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(219,39,119,0.39)] hover:shadow-[0_6px_20px_rgba(219,39,119,0.23)] hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" /> Generating...
                            </div>
                        ) : (
                            "Generate Thumbnail"
                        )}
                    </button>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-background/50 p-8 flex flex-col overflow-y-auto">
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
                    <h2 className="text-xl font-semibold mb-6">Preview</h2>

                    <div className="flex-1 border border-dashed border-border/60 rounded-2xl bg-secondary/20 flex items-center justify-center relative overflow-hidden group min-h-[500px]">
                        {isGenerating ? (
                            <div className="text-center space-y-4 animate-pulse">
                                <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-pink-500 animate-spin" />
                                </div>
                                <h3 className="text-xl font-medium">Generating your masterpiece...</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">This usually takes about 10-15 seconds. We&apos;re crafting the perfect thumbnail based on your inputs.</p>
                            </div>
                        ) : generatedImage ? (
                            <div className="relative w-full h-full p-8 flex items-center justify-center">
                                <div className={cn(
                                    "relative shadow-2xl transition-all duration-500 group-hover:scale-[1.01]",
                                    ratio === "16:9" ? "aspect-video w-full max-w-4xl" : ratio === "1:1" ? "aspect-square w-full max-w-xl" : "aspect-[9/16] h-full max-h-[80vh]"
                                )}>
                                    {/* Generated Result */}
                                    <div className="w-full h-full relative group">
                                        <img
                                            src={generatedImage}
                                            alt={title || "Generated Thumbnail"}
                                            className="w-full h-full object-cover rounded-lg shadow-2xl"
                                        />

                                        {/* Download Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent flex justify-center pb-8 rounded-b-lg">
                                            <a
                                                href={generatedImage}
                                                download={`thumbnail-${Date.now()}.png`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white text-black font-semibold px-6 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition-transform shadow-lg cursor-pointer"
                                            >
                                                <Download className="w-4 h-4" /> Download Thumbnail
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-2">
                                <div className="w-20 h-20 bg-secondary/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/30">
                                    <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground/80">Generate your first thumbnail</h3>
                                <p className="text-muted-foreground text-sm">Fill out the form and click Generate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
