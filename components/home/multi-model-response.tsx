"use client"

import { useState } from "react"
import { AIModel } from "./types"
import { Bot, Sparkles, ChevronDown } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    model?: AIModel
}

interface MultiModelResponseProps {
    messages: Message[]
}

export function MultiModelResponse({ messages }: MultiModelResponseProps) {
    // Default to the first message's model as active
    const [activeTabId, setActiveTabId] = useState<string>(messages[0]?.id)
    const [isTabsVisible, setIsTabsVisible] = useState(true)

    if (!messages.length) return null

    const activeMessage = messages.find(m => m.id === activeTabId) || messages[0]

    return (
        <div className="flex-1 w-full max-w-full">
            {/* Tab Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {messages.map((msg) => {
                        const isActive = activeTabId === msg.id
                        return (
                            <button
                                key={msg.id}
                                onClick={() => setActiveTabId(msg.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all whitespace-nowrap
                                    ${isActive
                                        ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-sm text-gray-900 dark:text-white'
                                        : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500'
                                    }
                                `}
                            >
                                {msg.model?.image ? (
                                    <img src={msg.model.image} alt="" className="w-4 h-4 object-contain" />
                                ) : (
                                    <Bot className="w-4 h-4" />
                                )}
                                <span>{msg.model?.displayName || 'AI'}</span>
                            </button>
                        )
                    })}
                </div>

                <button
                    onClick={() => setIsTabsVisible(!isTabsVisible)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2 flex-shrink-0"
                >
                    {isTabsVisible ? 'Hide tabs' : 'Show tabs'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${isTabsVisible ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Content Area */}
            {isTabsVisible && (
                <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800/50 p-5">
                    {/* Header for Active Model */}
                    <div className="mb-4 flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-zinc-800/50">
                        {activeMessage.model?.image ? (
                            <img src={activeMessage.model.image} alt="" className="w-5 h-5 object-contain" />
                        ) : (
                            <Bot className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {activeMessage.model?.displayName || "AI"}
                        </span>
                    </div>

                    <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 dark:prose-pre:bg-zinc-900 prose-pre:rounded-xl">
                        <ReactMarkdown>
                            {activeMessage.content}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    )
}
