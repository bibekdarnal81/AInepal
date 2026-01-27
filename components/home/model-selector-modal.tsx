"use client"

import { useState, useEffect } from "react"
import { Search, X, Check, Info, Heart, Bot, Sparkles, Zap, Cpu, Star } from "lucide-react"
import { AIModel, ModelSelectorProps } from "./types"

export function ModelSelectorModal({ isOpen, onClose, availableModels, selectedModels, onSelectModels }: ModelSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [currentSelection, setCurrentSelection] = useState<AIModel[]>([])
    const [activeCategory, setActiveCategory] = useState<'all' | 'chat' | 'image' | 'video'>('all')

    // Initialize current selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentSelection(selectedModels)
        }
    }, [isOpen, selectedModels])

    if (!isOpen) return null

    // Filter models based on search
    // Filter models based on search and category
    const filteredModels = availableModels.filter(model => {
        const matchesSearch = model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.provider.toLowerCase().includes(searchQuery.toLowerCase())

        let matchesCategory = true
        if (activeCategory === 'image') matchesCategory = !!model.supportsImageGeneration
        if (activeCategory === 'video') matchesCategory = !!model.supportsVideoGeneration
        // For 'chat', show generic models or explicitly chat supported ones. 
        // If no explicit chat flag, assume everything NOT purely image/video is chat, or just show all that support text.
        // For simplicity 'chat' can filter out pure image/video models if we had a flag, but for now we'll imply based on flags.
        // Actually, many models are multi-modal. Let's show models that are NOT strictly specialized if possible, or just everything for 'chat' category for now, 
        // OR filtering logic:
        // Text/Chat models typical characteristics: supportsStreaming usually, or just not ONLY specialized. 
        // Let's rely on user explicit filtering for Image/Video. For Chat, maybe we can show all?
        // Let's refine:
        // Image Tab -> supportsImageGeneration
        // Video Tab -> supportsVideoGeneration
        // Chat Tab -> !supportsImageGeneration && !supportsVideoGeneration ?? No, that hides GPT-4o. 
        // Let's just say Chat Tab shows ALL for now, or maybe emphasize text models.
        // Better: let's treat "Chat" as "All" for now or just have All/Image/Video.
        // Actually, let's make Chat Tab explicitly filter for things that likely support chat. 
        // Since we don't have supportsChat, let's assume ALL models support chat unless they are purely specialized (which we can't fully distinguish easily without a flag).
        // Let's stick with All / Image / Video tabs for clarity.

        return matchesSearch && matchesCategory
    })

    const toggleModel = (model: AIModel) => {
        setCurrentSelection(prev => {
            const exists = prev.find(m => m._id === model._id)
            if (exists) {
                return prev.filter(m => m._id !== model._id)
            } else {
                return [...prev, model]
            }
        })
    }

    const handleSave = () => {
        if (currentSelection.length === 0) {
            return
        }
        onSelectModels(currentSelection)
        onClose()
    }

    const removeAll = () => {
        setCurrentSelection([])
    }

    const removeModel = (modelId: string) => {
        setCurrentSelection(prev => prev.filter(m => m._id !== modelId))
    }

    // Helper to get icon for model if no image
    const getModelIcon = (provider: string) => {
        const p = provider.toLowerCase()
        if (p.includes('openai')) return <Cpu className="w-6 h-6 text-green-500" />
        if (p.includes('anthropic')) return <Star className="w-6 h-6 text-orange-500" />
        if (p.includes('google')) return <Sparkles className="w-6 h-6 text-blue-500" />
        if (p.includes('mistral')) return <Zap className="w-6 h-6 text-yellow-500" />
        if (p.includes('meta')) return <Bot className="w-6 h-6 text-blue-600" />
        return <Bot className="w-6 h-6 text-purple-600" />
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-zinc-800">
                {/* Header */}
                <div className="h-16 px-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Model Selection</h2>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 font-mono">esc</div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Model List */}
                    <div className="flex-1 flex flex-col p-6 min-w-0">
                        {/* Selected Models Chips */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Selected Chat Model(s)</h3>
                            <div className="flex flex-wrap gap-2">
                                {currentSelection.length === 0 && (
                                    <span className="text-sm text-gray-400 italic">None selected</span>
                                )}
                                {currentSelection.map(model => (
                                    <div key={model._id} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                                        {model.image ? (
                                            <img src={model.image} alt="" className="w-4 h-4 object-cover rounded-sm" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                        )}
                                        <span>{model.displayName}</span>
                                        <button onClick={() => removeModel(model._id)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex items-center gap-2 mb-4 px-1">
                            {(['all', 'chat', 'image', 'video'] as const).map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                                        ${activeCategory === category
                                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                        }
                                    `}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Search and Filters */}
                        <div className="flex items-center gap-4 mb-6 pt-2 border-t border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <Check className="w-5 h-5 rounded-full border border-green-600 dark:border-green-400 p-0.5" />
                                <span className="font-semibold text-gray-900 dark:text-white">Select at least 2 Chat Models</span>
                            </div>
                            <div className="flex-1"></div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search models"
                                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all"
                                />
                            </div>
                            <button className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
                                All models
                                <X className="w-3 h-3 rotate-45" />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
                                {filteredModels.map(model => {
                                    const isSelected = currentSelection.some(m => m._id === model._id)
                                    return (
                                        <div
                                            key={model._id}
                                            onClick={() => toggleModel(model)}
                                            className={`
                                                relative p-5 rounded-xl border cursor-pointer transition-all group h-[100px] flex items-center
                                                ${isSelected
                                                    ? 'bg-white dark:bg-zinc-800 border-black dark:border-white ring-1 ring-black dark:ring-white shadow-md'
                                                    : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                                                    {model.image ? (
                                                        <img src={model.image} alt={model.displayName} className="w-8 h-8 object-contain" />
                                                    ) : (
                                                        getModelIcon(model.provider)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-base mb-0.5">{model.displayName}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{model.provider}</p>
                                                </div>
                                            </div>

                                            {/* Heart Icon (Top Right) */}
                                            <button className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors">
                                                <Heart className="w-4 h-4" />
                                            </button>

                                            {/* Selection Indicator (Top Right - replaces Heart if selected?) 
                                                Actually design shows just border tick or something. 
                                                Let's stick to the border style for now, maybe add a checkmark badge later if needed.
                                            */}
                                            {isSelected && (
                                                <div className="absolute top-0 right-0 p-1 bg-black dark:bg-white rounded-bl-lg rounded-tr-lg">
                                                    <Check className="w-3 h-3 text-white dark:text-black" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="h-20 px-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-zinc-900">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Supported file types:</span>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200 dark:bg-zinc-800 flex items-center justify-center"><div className="w-3 h-3 bg-gray-400 rounded-sm" /></div> Images</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200 dark:bg-zinc-800 flex items-center justify-center"><div className="w-2 h-3 bg-gray-400 rounded-sm mx-auto" /></div> Audios</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-200 dark:bg-zinc-800 flex items-center justify-center"><div className="w-3 h-2 bg-gray-400 rounded-sm my-auto" /></div> Videos</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={removeAll}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-gray-200 dark:border-zinc-700"
                        >
                            Remove all
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={currentSelection.length === 0}
                            className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
