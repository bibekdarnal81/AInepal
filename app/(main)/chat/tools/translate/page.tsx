"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Copy, Check, RotateCcw, ArrowRightLeft } from "lucide-react"

const languages = [
    'Auto', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian', 'Nepali'
]

const targetLanguages = languages.filter(l => l !== 'Auto')

export default function TranslatePage() {
    const [inputText, setInputText] = useState('')
    const [sourceLang, setSourceLang] = useState('Auto')
    const [targetLang, setTargetLang] = useState('Spanish')
    const [output, setOutput] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!inputText.trim()) return

        const prompt = buildTranslatePrompt(inputText, sourceLang, targetLang)

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
        setInputText('')
        setOutput('')
    }

    const handleSwapLanguages = () => {
        if (sourceLang === 'Auto') return
        setSourceLang(targetLang)
        setTargetLang(sourceLang)
        setInputText(output)
        setOutput(inputText)
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
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Translate</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">

                {/* Language Controls */}
                <div className="bg-gray-50 dark:bg-zinc-900 mx-auto max-w-4xl p-2 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border border-gray-200 dark:border-zinc-800">
                    <select
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className="flex-1 w-full bg-transparent p-2 text-center sm:text-left text-gray-900 dark:text-white font-medium focus:outline-none cursor-pointer hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleSwapLanguages}
                        disabled={sourceLang === 'Auto'}
                        className="p-2 rounded-full hover:bg-white dark:hover:bg-zinc-800 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                    </button>

                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="flex-1 w-full bg-transparent p-2 text-center sm:text-right text-indigo-600 dark:text-indigo-400 font-medium focus:outline-none cursor-pointer hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        {targetLanguages.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Input */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Source Text
                            </label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter text to translate..."
                                className="w-full h-80 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !inputText.trim()}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Translating...
                                    </>
                                ) : (
                                    'Translate'
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
                                Translation
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
                                    Translation will appear here
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function buildTranslatePrompt(text: string, sourceLang: string, targetLang: string): string {
    return `Translate the following text from ${sourceLang === 'Auto' ? 'auto-detected language' : sourceLang} to ${targetLang}.\n\nText:\n"${text}"\n\nProvide ONLY the translation, without any explanations or additional text.`
}
