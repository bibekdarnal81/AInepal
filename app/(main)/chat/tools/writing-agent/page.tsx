"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Send, FileEdit, Trash2 } from "lucide-react"
import { ModelSelector } from "@/components/chat/model-selector"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function WritingAgentPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedModelId, setSelectedModelId] = useState('')

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        // System-like prompt behavior injected as context if first message or handling logic
        const prompt = messages.length === 0
            ? `You are an expert Writing Agent and Creative Coach. Help the user with their writing tasks, offer constructive feedback, brainstorm ideas, and help improve their draft. Be encouraging and insightful.\n\nUser: ${input}`
            : input

        try {
            const response = await fetch('/api/user/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    modelId: selectedModelId || 'default',
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to response')

            const aiMsg: Message = { role: 'assistant', content: data.response }
            setMessages(prev => [...prev, aiMsg])

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: " + (error instanceof Error ? error.message : 'An error occurred') }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
            <header className="h-14 px-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Writing Agent</h1>
                </div>
                <div className="flex items-center gap-2">
                    <ModelSelector selectedModelId={selectedModelId} onModelChange={setSelectedModelId} />
                    <button onClick={() => setMessages([])} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Clear Chat">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                                <FileEdit className="w-8 h-8 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How can I help you write today?</h2>
                                <p className="text-sm">I can help brainstorm, draft, edit, or refine your writing.</p>
                            </div>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-800'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-zinc-900 rounded-2xl px-4 py-3">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-2">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder="Ask for writing help..."
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[50px] max-h-[150px]"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
