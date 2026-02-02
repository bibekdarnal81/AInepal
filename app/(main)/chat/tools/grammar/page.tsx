"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Copy, Check, RotateCcw, Languages } from "lucide-react"

const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian', 'Nepali'
]

export default function GrammarPage() {
    const [grammarText, setGrammarText] = useState('')
    const [language, setLanguage] = useState('English')
    const [output, setOutput] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!grammarText.trim()) return

        const prompt = buildGrammarPrompt(grammarText, language)

        setLoading(true)
        setOutput('')

        try {
            const response = await fetch('/api/user/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    modelId: 'default', // Will use first available model
                    history: []
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate')
            }

            setOutput(data.response)
        } catch (error: any) {
            setOutput('Error: ' + error.message)
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

    const handleReset = () => {
        setGrammarText('')
        setOutput('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            handleGenerate()
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            {/* Header */}
            <header className="h-14 px-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Grammar Checker</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/chat/tools/write" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <Languages className="w-4 h-4" />
                        <span>Write Tool</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Input */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Text to check
                            </label>
                            <textarea
                                value={grammarText}
                                onChange={(e) => setGrammarText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Paste your text here to check for grammar, spelling, and style improvements..."
                                className="w-full h-80 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                        </div>

                        {/* Output Language */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Output language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !grammarText.trim()}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    'Check Grammar'
                                )}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Corrections
                            </label>
                            {output && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 text-green-500" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="min-h-[400px] p-6 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                </div>
                            ) : output ? (
                                <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap">
                                    {output}
                                </div>
                            ) : (
                                <p className="text-gray-400 dark:text-gray-500">
                                    Grammar corrections and suggestions will appear here
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function buildGrammarPrompt(text: string, language: string): string {
    return `Please check the following text for grammar, spelling, punctuation, and style improvements. Provide the corrected version and briefly list the changes you made.\n\nText to check:\n"${text}"\n\nOutput language: ${language}\n\nProvide:\n1. Corrected text\n2. List of corrections made`
}
