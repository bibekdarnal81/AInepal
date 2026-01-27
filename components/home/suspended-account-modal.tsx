"use client"

import { Ban, Lock, ShieldAlert } from "lucide-react"

interface SuspendedAccountModalProps {
    isOpen: boolean
}

export function SuspendedAccountModal({ isOpen }: SuspendedAccountModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-red-200 dark:border-red-900/50 relative">

                {/* Visual Header */}
                <div className="h-32 bg-red-500/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 dark:bg-red-500/10 pointer-events-none" />
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center z-10 animate-bounce delay-700 duration-1000">
                        <Lock className="w-10 h-10 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Account Suspended
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Your account has been suspended due to a violation of our terms of service or suspicious activity. You cannot access any services at this time.
                    </p>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4 mb-8 text-left flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">What can I do?</h4>
                            <p className="text-red-800 dark:text-red-400/80">
                                If you believe this is a mistake, please contact our support team immediately for assistance.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = 'mailto:support@ainepal.com'}
                        className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        Contact Support
                    </button>

                    <div className="mt-4">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
