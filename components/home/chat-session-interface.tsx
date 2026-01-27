"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Mic, Globe, Zap, PanelLeftClose, Bell, Loader2, Plus, ArrowUp, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import ReactMarkdown from 'react-markdown'
import { AIModel } from "./types"
import { ActiveModelsPopover } from "./active-models-popover"
import { ModelSelectorModal } from "./model-selector-modal"
import { MultiModelResponse } from "./multi-model-response"
import { useSidebar } from "./sidebar-provider"

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    model?: AIModel
    modelName?: string
}

interface ChatSession {
    id: string
    title: string
    modelId?: string
    messages: {
        role: 'user' | 'assistant'
        content: string
        modelId?: string
        modelName?: string
        timestamp: string
    }[]
}

interface ChatSessionInterfaceProps {
    availableModels: AIModel[]
    initialSession: ChatSession
}

export function ChatSessionInterface({ availableModels, initialSession }: ChatSessionInterfaceProps) {
    const { data: session } = useSession()
    const { toggleSidebar } = useSidebar()

    // Convert initial session messages to Message format
    const [messages, setMessages] = useState<Message[]>(
        initialSession.messages.map((m, idx) => ({
            id: `${initialSession.id}-${idx}`,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
            modelName: m.modelName,
        }))
    )
    const [input, setInput] = useState("")
    const [chatSessionId] = useState<string>(initialSession.id)

    // Model Selection State
    const [selectedModels, setSelectedModels] = useState<AIModel[]>(
        availableModels.length > 0 ? [availableModels[0]] : []
    )
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const firstName = session?.user?.name?.split(' ')[0] || "User"

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (!input.trim() || selectedModels.length === 0) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const chatPromises = selectedModels.map(async (model) => {
                try {
                    const response = await fetch('/api/user/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: userMsg.content,
                            modelId: model._id,
                            history: messages.map(m => ({ role: m.role, content: m.content })),
                            sessionId: chatSessionId
                        })
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to get response')
                    }

                    return {
                        id: Date.now() + Math.random().toString(),
                        role: 'assistant' as const,
                        content: data.response,
                        timestamp: new Date(),
                        model: model
                    }
                } catch (error: any) {
                    console.error(`Chat error with ${model.displayName}:`, error)
                    return {
                        id: Date.now() + Math.random().toString(),
                        role: 'assistant' as const,
                        content: "Error: " + error.message,
                        timestamp: new Date(),
                        model: model
                    }
                }
            })

            const responses = await Promise.all(chatPromises)
            setMessages(prev => [...prev, ...responses])

        } catch (error: any) {
            console.error('General chat error:', error)
        } finally {
            setLoading(false)
        }
    }

    const primaryModel = selectedModels[0]

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 relative selection:bg-green-100 dark:selection:bg-green-900/30">
            {/* Header */}
            <header className="h-16 px-4 flex items-center justify-between z-20 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500"
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                            {selectedModels.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    {selectedModels.length === 1 && selectedModels[0].image ? (
                                        <img src={selectedModels[0].image} alt="" className="w-4 h-4 object-contain rounded-sm" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-purple-500" />
                                    )}
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        {selectedModels.map(m => m.displayName).join(" | ")}
                                    </span>
                                </div>
                            ) : (
                                <span>Select Model</span>
                            )}
                        </button>

                        <ActiveModelsPopover
                            isOpen={isPopoverOpen}
                            onClose={() => setIsPopoverOpen(false)}
                            activeModels={selectedModels}
                            onOpenModal={() => setIsModalOpen(true)}
                        />
                    </div>

                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {initialSession.title}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full border border-blue-200 dark:border-blue-900/50">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Credits: {session?.user?.credits || 0}</span>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {firstName[0]}
                    </div>
                </div>
            </header>

            <ModelSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                availableModels={availableModels}
                selectedModels={selectedModels}
                onSelectModels={setSelectedModels}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar pb-32">
                <div className="max-w-3xl mx-auto px-4 min-h-full flex flex-col pt-6">
                    <div className="space-y-8">
                        {(() => {
                            const renderGroups = []
                            let i = 0
                            while (i < messages.length) {
                                const msg = messages[i]

                                if (msg.role === 'user') {
                                    renderGroups.push(
                                        <div key={msg.id} className="flex gap-4 justify-end">
                                            <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-5 py-3.5 max-w-[85%]">
                                                <div className="text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                                {firstName[0]}
                                            </div>
                                        </div>
                                    )
                                    i++
                                } else {
                                    const assistantMessages = []
                                    while (i < messages.length && messages[i].role === 'assistant') {
                                        assistantMessages.push(messages[i])
                                        i++
                                    }

                                    if (assistantMessages.length > 0) {
                                        if (assistantMessages.length > 1) {
                                            renderGroups.push(
                                                <div key={assistantMessages[0].id} className="flex gap-4 justify-start">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                                        <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <MultiModelResponse messages={assistantMessages} />
                                                </div>
                                            )
                                        } else {
                                            const singleMsg = assistantMessages[0]
                                            renderGroups.push(
                                                <div key={singleMsg.id} className="flex gap-4 justify-start">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                                        <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div className="flex-1 max-w-full">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                                {singleMsg.model?.displayName || singleMsg.modelName || "AI"}
                                                            </span>
                                                        </div>
                                                        <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-zinc-900 prose-pre:rounded-xl">
                                                            <ReactMarkdown>{singleMsg.content}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    }
                                }
                            }
                            return renderGroups
                        })()}

                        {loading && (
                            <div className="flex gap-4 justify-start">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white dark:from-zinc-950 dark:via-zinc-950 pt-8 pb-4 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-lg p-2">
                        <form onSubmit={handleSend} className="flex flex-col">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                                placeholder="Continue the conversation..."
                                className="w-full bg-transparent border-none outline-none text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 min-h-[48px] resize-none px-3 py-2"
                            />

                            <div className="flex items-center justify-between px-2 pb-1">
                                <div className="flex items-center gap-1">
                                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
                                        <Mic className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || loading}
                                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${input.trim() ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'}`}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
