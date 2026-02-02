"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Model {
    _id: string
    modelId: string
    displayName: string
    provider: string
    icon?: string
}

interface ModelSelectorProps {
    selectedModelId: string
    onModelChange: (modelId: string) => void
    className?: string
}

export function ModelSelector({ selectedModelId, onModelChange, className }: ModelSelectorProps) {
    const [models, setModels] = useState<Model[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch('/api/models')
                if (response.ok) {
                    const data = await response.json()
                    setModels(data.models || [])

                    // If no model selected and models exist, select the first one
                    if (!selectedModelId && data.models?.length > 0) {
                        onModelChange(data.models[0]._id)
                    }
                    // If "default" is selected, try to find the actual ID or keep it as is if backend handles "default"
                    // But for specific UI feedback, it's nice to know which one.
                }
            } catch (error) {
                console.error("Failed to fetch models", error)
            } finally {
                setLoading(false)
            }
        }
        fetchModels()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const selectedModel = models.find(m => m._id === selectedModelId) || models.find(m => m.modelId === 'default') || models[0]

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => !loading && setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-between min-w-[180px]"
                disabled={loading}
            >
                <div className="flex items-center gap-2 truncate">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <span className="truncate max-w-[140px]">
                                {selectedModel ? selectedModel.displayName : 'Select Model'}
                            </span>
                        </>
                    )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-full min-w-[220px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-20 py-1 max-h-[300px] overflow-y-auto">
                        {models.map(model => (
                            <button
                                key={model._id}
                                onClick={() => {
                                    onModelChange(model._id)
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 dark:text-gray-200">{model.displayName}</span>
                                    <span className="text-xs text-gray-400 capitalize bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                        {model.provider}
                                    </span>
                                </div>
                                {(selectedModelId === model._id) && (
                                    <Check className="w-4 h-4 text-indigo-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
