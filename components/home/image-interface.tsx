"use client"

import { useState, useEffect } from "react"
import { Sparkles, ChevronDown, ChevronUp, Upload, MessageSquare, Clock, Check, ImageIcon } from "lucide-react"



const styles = [
    { id: "auto", name: "Auto", image: "/placeholder-style.jpg" },
    { id: "3d_anime", name: "3D Anime", image: "/placeholder-style.jpg" },
    { id: "3d_model", name: "3D Model", image: "/placeholder-style.jpg" },
    { id: "japanese_anime", name: "Japanese Anime", image: "/placeholder-style.jpg" },
    { id: "movie", name: "Movie", image: "/placeholder-style.jpg" },
    { id: "comic", name: "Comic", image: "/placeholder-style.jpg" },
    { id: "cyberpunk", name: "Cyberpunk", image: "/placeholder-style.jpg" },
    { id: "fantasy", name: "Fantasy", image: "/placeholder-style.jpg" },
    { id: "oil_painting", name: "Oil Painting", image: "/placeholder-style.jpg" },
    { id: "colored_pencil", name: "Colored Pencil", image: "/placeholder-style.jpg" },
    { id: "realistic", name: "Realistic", image: "/placeholder-style.jpg" },
    { id: "watercolor", name: "Watercolor", image: "/placeholder-style.jpg" },
]

interface ImageInterfaceProps {
    availableModels?: any[] // Using any[] for flexibility with DB model type for now
}

export function ImageInterface({ availableModels = [] }: ImageInterfaceProps) {
    // Map DB models to interface format or use them directly if structure matches enough
    const displayModels = availableModels.map(m => ({
        id: m.modelId, // Use api identifier
        name: m.displayName,
        description: m.description,
        new: false,
        image: m.image
    }))

    const [selectedModel, setSelectedModel] = useState(displayModels.length > 0 ? displayModels[0] : null)
    const [selectedStyle, setSelectedStyle] = useState(styles[0])
    const [imageCount, setImageCount] = useState(1)
    const [aspectRatio, setAspectRatio] = useState("1:1")
    const [description, setDescription] = useState("")
    const [showModelDropdown, setShowModelDropdown] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [generatedImages, setGeneratedImages] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (generating || !description.trim() || !selectedModel) return

        setGenerating(true)
        setError(null)
        setGeneratedImages([])

        try {
            const response = await fetch('/api/image-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: description,
                    model: selectedModel.id,
                    style: selectedStyle.id,
                    aspectRatio: aspectRatio,
                    imageCount: imageCount,
                    referenceImage: uploadedImage
                })
            })

            const data = await response.json()
            console.log('API Response:', data)

            // Handle different response types
            if (data.success === false && data.message) {
                // API returned a message instead of images (e.g., text description)
                setError(data.message)
                return
            }

            if (!response.ok) {
                const errorMsg = data.error || data.message || data.details || 'Failed to generate image'
                throw new Error(errorMsg)
            }

            if (data.images && data.images.length > 0) {
                setGeneratedImages(data.images)
                setError(null)
            } else if (data.textResponse) {
                // Model returned text instead of image
                setError(`Image generation not available. Response: ${data.textResponse.substring(0, 200)}...`)
            } else {
                throw new Error(data.message || 'No images were generated. The model may not support image generation.')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate image')
            console.error('Image generation error:', err)
        } finally {
            setGenerating(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="flex w-full h-full bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Left Panel - Settings */}
            <div className="w-[280px] min-w-[280px] border-r border-gray-100 dark:border-zinc-800 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950">
                {/* Header */}
                <div className="h-12 px-4 flex items-center border-b border-gray-100 dark:border-zinc-800">
                    <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                        ← Image / Image creation
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    {/* Model Selection */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Model</label>
                        {selectedModel ? (
                            <>
                                <button
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {selectedModel.image ? (
                                                <img src={selectedModel.image} alt="" className="w-5 h-5 object-contain" />
                                            ) : (
                                                <span className="text-lg">🍌</span>
                                            )}
                                            <span className="font-medium text-sm">{selectedModel.name}</span>
                                        </div>
                                        {showModelDropdown ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedModel.description}</p>
                                </button>

                                {showModelDropdown && (
                                    <div className="mt-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                                        <div className="p-2 text-xs font-medium text-gray-500 border-b border-gray-100 dark:border-zinc-800">Switch model</div>
                                        {displayModels.map(model => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model)
                                                    setShowModelDropdown(false)
                                                }}
                                                className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${selectedModel.id === model.id ? 'bg-gray-50 dark:bg-zinc-800' : ''}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {model.image ? (
                                                        <img src={model.image} alt="" className="w-5 h-5 object-contain" />
                                                    ) : (
                                                        <span className="text-lg">🍌</span>
                                                    )}
                                                    <span className="font-medium text-sm">{model.name}</span>
                                                    {model.new && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">New</span>}
                                                    {selectedModel.id === model.id && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 ml-7">{model.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-lg border border-yellow-200 dark:border-yellow-800">
                                No image generation models configured. Please enable them in Admin settings.
                            </div>
                        )}
                    </div>

                    {/* Style Selection */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Style</label>
                        <div className="grid grid-cols-4 gap-2">
                            {styles.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`flex flex-col items-center p-2 rounded-xl border transition-all ${selectedStyle.id === style.id
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-zinc-700 hover:border-purple-300'}`}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-blue-400 mb-1 flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] text-center leading-tight">{style.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                        <div className="flex gap-2">
                            {["16:9", "1:1", "9:16"].map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${aspectRatio === ratio
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'}`}
                                >
                                    <div className={`border border-current rounded ${ratio === "16:9" ? "w-5 h-3" : ratio === "1:1" ? "w-4 h-4" : "w-3 h-5"}`}></div>
                                    <span>{ratio}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Count */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Images</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(count => (
                                <button
                                    key={count}
                                    onClick={() => setImageCount(count)}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${imageCount === count
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'}`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Description */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Image Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the image you want to generate..."
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Upload Reference */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Upload reference (Optional)</label>
                        <label className="block border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer relative overflow-hidden">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {uploadedImage ? (
                                <div className="relative">
                                    <img src={uploadedImage} alt="Reference" className="max-h-32 mx-auto rounded-lg" />
                                    <button
                                        onClick={(e) => { e.preventDefault(); setUploadedImage(null); }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload or drag image here</p>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {/* Confirm Button */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !selectedModel}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {generating ? 'Generating...' : 'Confirm'} <span className="text-xs">+ 8</span>
                    </button>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-zinc-900 dark:to-zinc-950 p-8 overflow-y-auto">
                <div className="text-center max-w-2xl mx-auto w-full">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Image creation</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Choose from various image models like Nano Banana Pro in the left panel.
                        Select your style and ratio, describe your scene, and create stunning AI-generated images.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Generated Images Grid */}
                    {generatedImages.length > 0 ? (
                        <div className={`grid gap-4 ${generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {generatedImages.map((img, idx) => (
                                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                                    <img
                                        src={img}
                                        alt={`Generated ${idx + 1}`}
                                        className="w-full h-auto"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                        <a
                                            href={img}
                                            download={`generated-image-${idx + 1}.png`}
                                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-sm font-medium transition-colors"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>


                            {/* Generation Preview / Empty State */}
                            <div className={`w-full max-w-sm mx-auto border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 ${aspectRatio === "16:9" ? "aspect-video" : aspectRatio === "9:16" ? "aspect-[9/16] max-w-[200px]" : "aspect-square"}`}>
                                {generating ? (
                                    <div className="animate-pulse flex flex-col items-center gap-2">
                                        <Sparkles className="w-8 h-8 text-purple-500 animate-spin" />
                                        <span className="text-sm text-gray-500">Generating with {selectedModel?.name}...</span>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-400">Your generated images will appear here</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
