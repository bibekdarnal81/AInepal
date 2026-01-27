"use client"

import { X, AlertCircle, Sparkles, CreditCard } from "lucide-react"

interface InsufficientCreditsModalProps {
    isOpen: boolean
    onClose: () => void
    requiredCredits?: number
    currentCredits?: number
}

export function InsufficientCreditsModal({
    isOpen,
    onClose,
    requiredCredits = 2,
    currentCredits = 0
}: InsufficientCreditsModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-zinc-800 scale-100">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Insufficient Credits
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-red-500" />
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Out of Credits
                    </h4>

                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        This action requires <span className="font-bold text-gray-900 dark:text-white">{requiredCredits} credits</span>,
                        but you only have <span className="font-bold text-red-500">{currentCredits} credits</span> remaining.
                    </p>

                    <div className="w-full bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-800 mb-6">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500 dark:text-gray-400">Current Balance</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{currentCredits}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-red-500 w-0" style={{ width: `${Math.min((currentCredits / requiredCredits) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-xs mt-2 text-gray-400">
                            <span>0</span>
                            <span>Req: {requiredCredits}</span>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" />
                            Upgrade Plan
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
