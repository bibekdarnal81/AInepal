'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sun, Settings } from 'lucide-react'

interface ToolLayoutProps {
    toolName: string
    toolDescription: string
    icon: ReactNode
    children: ReactNode
}

export function ToolLayout({ toolName, toolDescription, icon, children }: ToolLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/tools"
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="text-emerald-600">
                                {icon}
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-900">{toolName}</h1>
                                <p className="text-sm text-slate-500">{toolDescription}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Sun className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
