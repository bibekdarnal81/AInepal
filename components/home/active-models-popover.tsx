"use client"

import { useState } from "react"
import { Sparkles, Repeat, Settings2, Plus, ChevronRight, X } from "lucide-react"
import { AIModel } from "./types"

interface ActiveModelsPopoverProps {
    isOpen: boolean
    onClose: () => void
    activeModels: AIModel[]
    onOpenModal: () => void
}

export function ActiveModelsPopover({ isOpen, onClose, activeModels, onOpenModal }: ActiveModelsPopoverProps) {
    if (!isOpen) return null

    return (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 origin-top-left">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Models</span>
                <span className="text-xs text-gray-400">{activeModels.length} active</span>
            </div>

            {/* List */}
            <div className="p-2 space-y-1">
                {activeModels.map(model => (
                    <div key={model._id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg group transition-colors">
                        <div className="flex items-center gap-3">
                            {model.image ? (
                                <img src={model.image} alt="" className="w-8 h-8 object-contain rounded-md bg-gray-50 dark:bg-zinc-800" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                            )}
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{model.displayName}</div>
                                {model.modelName && <div className="text-[10px] text-gray-400 capitalize">{model.provider}</div>}
                            </div>
                        </div>

                        {/* Toggle Switch (Visual for now) */}
                        <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-green-500 transition-colors">
                            <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform translate-x-4.5 translate-x-[18px]" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Action */}
            <div className="p-2 border-t border-gray-100 dark:border-zinc-800">
                <button
                    onClick={() => {
                        onClose()
                        onOpenModal()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg transition-colors group"
                >
                    <Repeat className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    <span>Change Models</span>
                </button>
            </div>
        </div>
    )
}
