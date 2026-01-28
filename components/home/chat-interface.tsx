"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Paperclip, Sparkles, Search, Mic, Globe, Menu, PanelLeftClose, Bell, Loader2, Plus, ArrowUp, ChevronRight, ChevronDown, Pencil, Languages, FileSearch, FileText, Network, BookOpen, Bookmark, Wand2, Package, FileEdit, Table, Podcast, ClipboardList, LayoutGrid } from "lucide-react"
import { useSession } from "next-auth/react"
import ReactMarkdown from 'react-markdown'
import { AIModel } from "./types"
import { CodeBlock } from "./code-block"
import { ActiveModelsPopover } from "./active-models-popover"
import { ModelSelectorModal } from "./model-selector-modal"
import { InsufficientCreditsModal } from "./insufficient-credits-modal"
import { SuspendedAccountModal } from "./suspended-account-modal"
import { MultiModelResponse } from "./multi-model-response"
import { useSidebar } from "./sidebar-provider"
import Link from "next/link"
import { getSocket } from "@/lib/socket-client"

// Tools data for main page display
const tools = [
    { name: 'Write', icon: Pencil, href: '/chat/tools/write', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'Grammar checker', icon: FileEdit, href: '/chat/tools/grammar', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'Translate', icon: Languages, href: '/chat/tools/translate', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: 'AI Detector', icon: FileSearch, href: '/chat/tools/detector', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'ChatPDF', icon: FileText, href: '/chat/tools/chatpdf', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'Mindmap', icon: Network, href: '/chat/tools/mindmap', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: 'Search', icon: Search, href: '/chat/tools/search', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: 'Bots', icon: Bot, href: '/chat/tools/bots', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: 'Read', icon: BookOpen, href: '/chat/tools/read', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'Memo', icon: Bookmark, href: '/chat/tools/memo', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'AI Humanizer', icon: Wand2, href: '/chat/tools/humanizer', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'Toolbox', icon: Package, href: '/chat/tools/toolbox', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: 'Writing Agent', icon: FileEdit, href: '/chat/tools/writing-agent', color: 'text-gray-700 dark:text-gray-300' },
    { name: 'Sheet filler', icon: Table, href: '/chat/tools/sheet', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: 'Podcast', icon: Podcast, href: '/chat/tools/podcast', color: 'text-indigo-600 dark:text-indigo-400' },
    { name: 'Form', icon: ClipboardList, href: '/chat/tools/form', color: 'text-gray-700 dark:text-gray-300' },
]

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    model?: AIModel // specific model that generated this message
}

interface ChatInterfaceProps {
    availableModels: AIModel[]
    advancedCredits?: number
    membershipName?: string
    membershipAdvancedCredits?: number
}

export function ChatInterface({
    availableModels,
    advancedCredits = 0,
    membershipName = '',
    membershipAdvancedCredits = 0
}: ChatInterfaceProps) {
    const { data: session } = useSession()
    const { toggleSidebar } = useSidebar()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [chatSessionId, setChatSessionId] = useState<string | null>(null)

    // Model Selection State
    // Default to first available model if no selection
    const [selectedModels, setSelectedModels] = useState<AIModel[]>(
        availableModels.length > 0 ? [availableModels[0]] : []
    )
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showCreditModal, setShowCreditModal] = useState(false)
    const [isSuspended, setIsSuspended] = useState(false)
    const [requiredCredits, setRequiredCredits] = useState(2)

    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Socket Integration
    useEffect(() => {
        if (!session?.user?.id) return

        const socket = getSocket()

        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/user/credits')
                if (res.ok) {
                    const data = await res.json()
                    setLocalAdvancedCredits(data.advancedCredits)
                    if (data.membershipName) setLocalMembershipName(data.membershipName)
                    if (data.membershipAdvancedCredits !== undefined) setLocalMembershipAdvancedCredits(data.membershipAdvancedCredits)
                    if (data.isSuspended) setIsSuspended(true)
                }
            } catch (error) {
                console.error('Failed to fetch credits:', error)
            }
        }

        const onConnect = () => {
            console.log('Socket connected')
            socket.emit('join-room', session.user.id)
            fetchCredits()
        }

        // Initial fetch
        fetchCredits()

        const onCreditsUpdated = (data: { credits: number, advancedCredits: number }) => {
            // Update advancedCredits in real-time from socket event
            setLocalAdvancedCredits(data.advancedCredits)
        }

        const onNewMessage = (data: { sessionId: string, message: Message }) => {
            setMessages(prev => {
                const exists = prev.some(m =>
                    m.role === data.message.role &&
                    m.content === data.message.content &&
                    m.model?.modelId === data.message.model?.modelId
                )
                if (!exists) {
                    return [...prev, { ...data.message, id: Date.now().toString() }]
                }
                return prev
            })
            if (!chatSessionId && data.sessionId) {
                setChatSessionId(data.sessionId)
            }
        }

        socket.on('connect', onConnect)
        socket.on('credits-updated', onCreditsUpdated)
        socket.on('new-message', onNewMessage)

        // If already connected
        if (socket.connected) {
            onConnect()
        }

        return () => {
            socket.off('connect', onConnect)
            socket.off('credits-updated', onCreditsUpdated)
            socket.off('new-message', onNewMessage)
        }
    }, [session?.user?.id])

    // Local state for real-time updates
    const [localAdvancedCredits, setLocalAdvancedCredits] = useState(advancedCredits)
    const [localMembershipName, setLocalMembershipName] = useState(membershipName)
    const [localMembershipAdvancedCredits, setLocalMembershipAdvancedCredits] = useState(membershipAdvancedCredits)

    // Sync local state when props change
    useEffect(() => {
        setLocalAdvancedCredits(advancedCredits)
        setLocalMembershipName(membershipName)
        setLocalMembershipAdvancedCredits(membershipAdvancedCredits)
    }, [advancedCredits, membershipName, membershipAdvancedCredits])

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 18) return "Good afternoon"
        return "Good evening"
    }

    // Get first name
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
            // Create a promise for each selected model
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

                    // Update session ID from response if new
                    if (data.sessionId && !chatSessionId) {
                        setChatSessionId(data.sessionId)
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

                    if (error.message?.includes("Insufficient advanced credits")) {
                        const match = error.message.match(/requires (\d+) credits/);
                        if (match) {
                            setRequiredCredits(parseInt(match[1]));
                        }
                        setShowCreditModal(true)
                        // Return a specific error message that we can filter out or display differently if needed
                        // For now, let's just return the error so it's logged in chat as well,
                        // or maybe return a dummy message that won't be shown?
                        // Let's show it in chat too.
                    } else if (error.message?.includes("suspended")) { // Added suspended account error handling
                        setIsSuspended(true)
                    }

                    return {
                        id: Date.now() + Math.random().toString(),
                        role: 'assistant' as const,
                        content: "Error: " + error.message,
                        timestamp: new Date(),
                        model: model
                    }
                }
            })

            // Wait for all responses (in parallel)
            const responses = await Promise.all(chatPromises)

            // Add all responses to state
            setMessages(prev => [...prev, ...responses])

        } catch (error: any) {
            console.error('General chat error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Primary model for display purposes
    const primaryModel = selectedModels[0]

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 relative selection:bg-green-100 dark:selection:bg-green-900/30">
            {/* Header */}
            <header className="h-16 px-4 flex items-center justify-between z-20 border-b border-transparent">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500"
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>


                    {/* Model Selector Popover Trigger */}
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

                        {/* Active Models Popover */}
                        <ActiveModelsPopover
                            isOpen={isPopoverOpen}
                            onClose={() => setIsPopoverOpen(false)}
                            activeModels={selectedModels}
                            onOpenModal={() => setIsModalOpen(true)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {localMembershipName && (
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold rounded-full border border-green-200 dark:border-green-900/50">
                            <span>{localMembershipName}</span>
                        </div>
                    )}
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-bold rounded-full border border-purple-200 dark:border-purple-900/50 relative group cursor-help">
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>AdvancedCredit: {localAdvancedCredits}{localMembershipAdvancedCredits > 0 && ` / ${localMembershipAdvancedCredits}`}</span>
                        {/* Credit costs tooltip */}
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">Credit Costs:</p>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex justify-between"><span>💬 Chat</span><span className="font-medium">2 credits</span></div>
                                <div className="flex justify-between"><span>🖼️ Image</span><span className="font-medium">5 credits</span></div>
                                <div className="flex justify-between"><span>🎬 Video</span><span className="font-medium">20 credits</span></div>
                                <div className="flex justify-between"><span>🎵 Audio</span><span className="font-medium">10 credits</span></div>
                            </div>
                        </div>
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

            {/* Model Selector Modal */}
            <ModelSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                availableModels={availableModels}
                selectedModels={selectedModels}
                onSelectModels={setSelectedModels}
            />

            {/* Insufficient Credits Modal */}
            <InsufficientCreditsModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                currentCredits={localAdvancedCredits}
                requiredCredits={requiredCredits}
            />

            {/* Suspended Account Modal */}
            <SuspendedAccountModal isOpen={isSuspended} />

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar pb-32">
                <div className="max-w-3xl mx-auto px-4 min-h-full flex flex-col pt-6">

                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center mb-12">
                            {/* Greeting */}
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-center text-gray-900 dark:text-white">
                                {getGreeting()}, <span className="text-green-500">{firstName}!</span>
                            </h1>

                            {/* Main Input Box (Initial State) */}
                            <div className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none p-2 mb-8 relative z-10 transition-shadow hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.15)]">
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
                                        placeholder={selectedModels.length > 1 ? "Message multiple models..." : "How to stay productive at home?"}
                                        className="w-full bg-transparent border-none outline-none text-lg text-gray-800 dark:text-gray-100 placeholder:text-gray-400 min-h-[60px] resize-none px-4 py-3"
                                    />

                                    <div className="flex items-center justify-between px-2 pb-1">
                                        <div className="flex items-center gap-1">
                                            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors tooltip-trigger" title="Add attachment">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors" title="Web Search">
                                                <Globe className="w-5 h-5" />
                                            </button>

                                            <div className="hidden md:flex items-center gap-2 ml-2">
                                                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors">
                                                    <Bot className="w-3.5 h-3.5" />
                                                    <span>Combine</span>
                                                </button>
                                                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors">
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    <span>Compare</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
                                                <Mic className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!input.trim() || loading}
                                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${input.trim() ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'}`}
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Tools Grid Section */}
                            <div className="w-full max-w-4xl mx-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <LayoutGrid className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tools</h2>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                    {tools.map((tool) => {
                                        const Icon = tool.icon
                                        return (
                                            <Link
                                                key={tool.name}
                                                href={tool.href}
                                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 transition-all hover:scale-105 hover:shadow-md group"
                                            >
                                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 group-hover:bg-gray-50 dark:group-hover:bg-zinc-700 transition-colors shadow-sm">
                                                    <Icon className={`w-5 h-5 ${tool.color}`} />
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight line-clamp-2">
                                                    {tool.name}
                                                </span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Footer Text */}
                            <div className="mt-auto md:mb-12 text-center">
                                <p className="text-gray-400 text-sm">Your all-in-one AI Platform</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {(() => {
                                const renderGroups = []
                                let i = 0
                                while (i < messages.length) {
                                    const msg = messages[i]

                                    if (msg.role === 'user') {
                                        // Render User Message
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
                                        // Collect all consecutive assistant messages
                                        const assistantMessages = []
                                        while (i < messages.length && messages[i].role === 'assistant') {
                                            assistantMessages.push(messages[i])
                                            i++
                                        }

                                        if (assistantMessages.length > 0) {
                                            if (assistantMessages.length > 1) {
                                                // Render Multi-Model Response Tab View
                                                renderGroups.push(
                                                    <div key={assistantMessages[0].id} className="flex gap-4 justify-start">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                                            <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <MultiModelResponse messages={assistantMessages} />
                                                    </div>
                                                )
                                            } else {
                                                // Render Single Assistant Response
                                                const singleMsg = assistantMessages[0]
                                                renderGroups.push(
                                                    <div key={singleMsg.id} className="flex gap-4 justify-start">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                                            <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div className="flex-1 max-w-full">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                                    {singleMsg.model?.displayName || "AI"}
                                                                </span>
                                                            </div>
                                                            <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none">
                                                                <ReactMarkdown
                                                                    components={{
                                                                        code: CodeBlock
                                                                    }}
                                                                >
                                                                    {singleMsg.content}
                                                                </ReactMarkdown>
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
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-1.5 h-10 px-4">
                                        <div className="w-2 h-2 bg-gray-300 dark:bg-zinc-700 rounded-full animate-bounce delay-0" />
                                        <div className="w-2 h-2 bg-gray-300 dark:bg-zinc-700 rounded-full animate-bounce delay-150" />
                                        <div className="w-2 h-2 bg-gray-300 dark:bg-zinc-700 rounded-full animate-bounce delay-300" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Footer Text for chat view */}
                    {messages.length > 0 && (
                        <div className="mt-8 mb-4 text-center">
                            <p className="text-gray-400 text-xs">Your all-in-one AI Platform</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Input Area (Only visible when messages exist) */}
            {messages.length > 0 && (
                <div className="absolute bottom-6 left-0 right-0 z-30 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[2rem] shadow-xl flex items-end p-2 relative">
                            {/* Floating Actions Overlay could go here if needed, keeping simple for now */}

                            <form onSubmit={handleSend} className="flex-1 flex items-end w-full">
                                <button type="button" className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 transition-colors mb-0.5 ml-1">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 transition-colors mb-0.5">
                                    <Globe className="w-5 h-5" />
                                </button>

                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    placeholder={selectedModels.length > 1 ? "Message multiple models..." : "Message..."}
                                    className="flex-1 bg-transparent border-none outline-none text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 min-h-[44px] max-h-[120px] resize-none py-3 px-3 mx-1"
                                    rows={1}
                                />

                                <div className="flex items-center gap-1 mb-0.5 mr-1">
                                    <button type="button" className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-500 transition-colors">
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || loading}
                                        className={`p-2 rounded-full transition-all ${input.trim() ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-zinc-800 text-gray-400'}`}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                                    </button>
                                </div>
                            </form>

                            {/* Combine/Compare Buttons Floating above input if needed, or inline */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
