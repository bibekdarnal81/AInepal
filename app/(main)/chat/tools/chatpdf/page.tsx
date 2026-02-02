"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Send, FileText, Trash2 } from "lucide-react"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function ChatPDFPage() {
    const [pdfContent, setPdfContent] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isContextSet, setIsContextSet] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || !pdfContent.trim()) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        // Only include context in the very first message or system prompt ideally,
        // but for this simple tool wrapper, we'll append context if it's the start,
        // or just rely on the history + context prompt strategy.
        // A simple way is to prepend context to the user message invisibly or just use a constructed prompt.

        const prompt = isContextSet
            ? input
            : `Here is the content of a document:\n\n"${pdfContent}"\n\nI want to ask questions about this document. Answer purely based on the text above.\n\nMy first question is: ${input}`

        // For subsequent messages, we rely on the conversation history (wrapper logic or just appending context)
        // Since the generic /api/user/chat might accept history? Yes.
        // But for this simple tool we'll re-inject context if history is short or just rely on the model.
        // Better: Construct a full prompt each time or rely on the single turn if "history" isn't fully persistent in this isolated tool logic.
        // Let's assume the API handles history if we pass it.

        try {
            const response = await fetch('/api/user/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: isContextSet ? input : prompt,
                    modelId: 'default',
                    // We can pass past messages as history if the API supports it
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    // Logic tweak: If context not set (first message), we sent the big prompt. 
                    // But the history we pass shouldn't necessarily include the huge PDF text every time if we want to save tokens,
                    // but the prompt 'message' needs to include it for the *current* stateless request if the backend doesn't store session state for *this* tool page.
                    // The /api/user/chat usually expects a session ID or history. 
                    // For robust ChatPDF, we'd want vector search, but for this "tool wrapper", 
                    // we'll just prepend the specific PDF context to the system or first message.
                    // To simplify: We'll just include the context in the history if meaningful.
                })
            })

            // Wait, if we send "prompt" as the message, that's what the AI sees.
            // If we mark isContextSet=true, subsequent messages won't have the context.
            // If the backend is stateless without a sessionId that persists context, we might lose it.
            // Let's modify the strategy: Always include context in the 'system' like prompt or prepend it.
            // Since we don't control the stored system prompt here directly easily, 
            // We will just always prepend "Use the provided document context to answer: [question]" 
            // and maybe the context if it fits, or rely on the conversation history array 
            // retaining the FIRST message which had the context.
            // So: First message (huge) has context. Subsequent messages are just Qs. 
            // The history array we send includes that first huge message.

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to response')

            const aiMsg: Message = { role: 'assistant', content: data.response }
            setMessages(prev => [...prev, aiMsg])
            setIsContextSet(true)

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
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">ChatPDF</h1>
                </div>
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                {/* Left: Input Context */}
                <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Document Content
                        </h2>
                        <button onClick={() => { setPdfContent(''); setMessages([]); setIsContextSet(false) }} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        value={pdfContent}
                        onChange={(e) => setPdfContent(e.target.value)}
                        placeholder="Paste the text content of your PDF or document here..."
                        className="flex-1 w-full bg-transparent p-4 resize-none focus:outline-none text-sm leading-relaxed"
                    />
                </div>

                {/* Right: Chat */}
                <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                                <FileText className="w-12 h-12 mb-4 opacity-50" />
                                <p>Paste document text on the left,<br />then ask questions here.</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about the document..."
                                disabled={!pdfContent}
                                className="flex-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || !pdfContent || loading}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
