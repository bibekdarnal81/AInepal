"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { MoreHorizontal, Plus, Search, Sparkles, Bot, ChevronDown, Zap, Star, Cpu } from "lucide-react"

interface AIModel {
    _id: string
    displayName: string
    provider: string
    modelId: string
}

export function ChatSidebar({ models = [] }: { models?: AIModel[] }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentModelId = searchParams.get('model')

    // Default models if none provided
    const defaultModels = [
        { name: "Monica", icon: Bot, color: "text-purple-600", active: true },
        { name: "Gemini 3 Flash", icon: Sparkles, color: "text-blue-500" },
        { name: "GPT-5.2", icon: Cpu, color: "text-green-500" },
        { name: "Gemini 3 Pro", icon: Sparkles, color: "text-blue-600" },
        { name: "Claude 4.5 Opus", icon: Star, color: "text-orange-500" },
        { name: "Claude 4.5 Sonnet", icon: Star, color: "text-orange-400" },
        { name: "Claude 4.5 Haiku", icon: Star, color: "text-pink-400" },
        { name: "GPT-5.1", icon: Cpu, color: "text-green-500" },
        { name: "GPT-5", icon: Cpu, color: "text-green-400" },
        { name: "Google Nano Banana", icon: Zap, color: "text-yellow-500" },
        { name: "Claude 4 Sonnet", icon: Star, color: "text-orange-300" },
        { name: "Claude 4 Opus", icon: Star, color: "text-orange-400" },
        { name: "Grok Code Fast 1", icon: Zap, color: "text-gray-500" },
        { name: "Grok 4", icon: Zap, color: "text-gray-400" },
        { name: "Grok 3", icon: Zap, color: "text-gray-400" },
        { name: "GPT-4o", icon: Cpu, color: "text-green-500" },
        { name: "GPT-4.1", icon: Cpu, color: "text-green-400" },
    ]

    const recentChats = [
        "Greetings",
        "Greeting and Assistance",
        "Hotel POS System Overview"
    ]

    return (
        <aside className="w-[280px] h-screen bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-800 flex flex-col flex-shrink-0 z-30">
            {/* Search Bar */}
            <div className="p-3 pb-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search bots or chats..."
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 border border-gray-300 dark:border-zinc-600 rounded px-1.5 py-0.5 text-[10px] text-gray-400 bg-white dark:bg-zinc-800">⌘K</div>
                </div>
            </div>

            {/* New Chat Button */}
            <div className="px-3 py-3">
                <Link href="/chat" className="w-full bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-purple-400 dark:hover:border-purple-500 text-gray-600 dark:text-gray-300 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <Plus className="w-4 h-4" />
                    New Chat
                </Link>
            </div>

            {/* Model List */}
            <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
                <div className="space-y-0.5">
                    {defaultModels.map((model, idx) => (
                        <button
                            key={idx}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${model.active
                                ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <div className={`w-5 h-5 flex items-center justify-center ${model.color}`}>
                                <model.icon className="w-4 h-4" />
                            </div>
                            <span className="truncate">{model.name}</span>
                        </button>
                    ))}
                </div>

                {/* Recent Chats */}
                <div className="mt-6 mb-4">
                    <div className="px-2 mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent</span>
                        <MoreHorizontal className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                    <div className="px-2 py-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">Today</div>
                    <div className="space-y-0.5">
                        {recentChats.map((chat, i) => (
                            <button key={i} className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white truncate transition-colors">
                                {chat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}
