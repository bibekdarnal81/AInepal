"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Copy, Check } from "lucide-react"

export default function ToolboxPage() {
    const [problem, setProblem] = useState('')
    const [output, setOutput] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!problem.trim()) return

        const prompt = `Suggest a comprehensive toolkit or list of resources/tools to solve the following problem or task: "${problem}". \nCategorize the suggestions.`

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
            if (!response.ok) throw new Error(data.error || 'Failed to find tools')
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
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Toolbox Recommender</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Describe your problem or task
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="e.g. Building a mobile app, Planning a wedding..."
                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !problem.trim()}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Tools'}
                            </button>
                        </div>
                    </div>

                    {output && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Tools</h2>
                                <button onClick={handleCopy} className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                                    {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy list</>}
                                </button>
                            </div>
                            <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                                {output}
                            </div>
                        </div>
                    )}

                    {!output && !loading && (
                        <div className="text-center text-gray-400 dark:text-gray-600 py-12">
                            Need the right tools for the job? Just ask!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
