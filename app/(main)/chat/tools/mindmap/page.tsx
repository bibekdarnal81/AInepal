"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Copy, Check, RotateCcw } from "lucide-react"

export default function MindmapPage() {
    const [topic, setTopic] = useState('')
    const [output, setOutput] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!topic.trim()) return

        const prompt = `Create a detailed mind map for the topic: "${topic}". \nProvide the output in Mermaid.js syntax so it can be rendered as a diagram. Start with 'graph TD'.`

        setLoading(true)
        setOutput('')

        try {
            const response = await fetch('/api/user/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    modelId: 'default',
                    history: []
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to generate')
            setOutput(data.response)
        } catch (error) {
            setOutput('Error: ' + (error instanceof Error ? error.message : 'An error occurred'))
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!output) return
        await navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <header className="h-14 px-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mindmap Generator</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Topic
                            </label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter a topic for your mind map..."
                                className="w-full h-80 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !topic.trim()}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Mindmap'}
                            </button>
                            <button onClick={() => { setTopic(''); setOutput('') }} className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors">
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mermaid Code</label>
                            {output && (
                                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            )}
                        </div>
                        <div className="min-h-[400px] p-6 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-sm overflow-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : output ? (
                                <pre className="whitespace-pre-wrap">{output}</pre>
                            ) : (
                                <p className="text-gray-400 dark:text-gray-500">Mindmap code will appear here</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
