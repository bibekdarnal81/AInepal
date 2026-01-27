"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, LayoutGrid, Loader2, Copy, Check, RotateCcw } from "lucide-react"

type Tab = 'compose' | 'reply' | 'grammar'
type Length = 'auto' | 'short' | 'medium' | 'long'
type Format = 'auto' | 'email' | 'message' | 'comment' | 'paragraph' | 'article' | 'blog-post' | 'ideas' | 'outline' | 'twitter'
type Tone = 'auto' | 'amicable' | 'casual' | 'friendly' | 'professional' | 'witty' | 'funny' | 'formal'

const formatOptions: { value: Format; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'email', label: 'Email' },
    { value: 'message', label: 'Message' },
    { value: 'comment', label: 'Comment' },
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'article', label: 'Article' },
    { value: 'blog-post', label: 'Blog Post' },
    { value: 'ideas', label: 'Ideas' },
    { value: 'outline', label: 'Outline' },
    { value: 'twitter', label: 'Twitter' },
]

const toneOptions: { value: Tone; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'amicable', label: 'Amicable' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' },
    { value: 'witty', label: 'Witty' },
    { value: 'funny', label: 'Funny' },
    { value: 'formal', label: 'Formal' },
]

const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian', 'Nepali'
]

export default function WritePage() {
    const [activeTab, setActiveTab] = useState<Tab>('compose')
    const [input, setInput] = useState('')
    const [replyTo, setReplyTo] = useState('')
    const [grammarText, setGrammarText] = useState('')
    const [length, setLength] = useState<Length>('auto')
    const [format, setFormat] = useState<Format>('auto')
    const [tone, setTone] = useState<Tone>('auto')
    const [language, setLanguage] = useState('English')
    const [output, setOutput] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        let prompt = ''

        if (activeTab === 'compose') {
            if (!input.trim()) return
            prompt = buildComposePrompt(input, length, format, tone, language)
        } else if (activeTab === 'reply') {
            if (!replyTo.trim()) return
            prompt = buildReplyPrompt(replyTo, input, tone, language)
        } else if (activeTab === 'grammar') {
            if (!grammarText.trim()) return
            prompt = buildGrammarPrompt(grammarText, language)
        }

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
        setInput('')
        setReplyTo('')
        setGrammarText('')
        setOutput('')
        setLength('auto')
        setFormat('auto')
        setTone('auto')
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
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Write</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/chat/tools/writing-agent" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <LayoutGrid className="w-4 h-4" />
                        <span>Writing Agent</span>
                    </Link>
                    <Link href="/chat" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <LayoutGrid className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
                    {(['compose', 'reply', 'grammar'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab
                                    ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Input */}
                    <div className="space-y-6">
                        {activeTab === 'compose' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Write about
                                    </label>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Tell me what to write for you. Hit ⌘+Enter to generate."
                                        className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    />
                                </div>

                                {/* Length */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Length
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['auto', 'short', 'medium', 'long'] as Length[]).map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => setLength(l)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${length === l
                                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Format */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Format
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {formatOptions.map((f) => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFormat(f.value)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format === f.value
                                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tone
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {toneOptions.map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => setTone(t.value)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tone === t.value
                                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'reply' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Message to reply to
                                    </label>
                                    <textarea
                                        value={replyTo}
                                        onChange={(e) => setReplyTo(e.target.value)}
                                        placeholder="Paste the message you want to reply to..."
                                        className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Key points for reply (optional)
                                    </label>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Add any specific points you want to include in your reply..."
                                        className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Tone for Reply */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tone
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {toneOptions.map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => setTone(t.value)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tone === t.value
                                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'grammar' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Text to check
                                </label>
                                <textarea
                                    value={grammarText}
                                    onChange={(e) => setGrammarText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Paste your text here to check for grammar, spelling, and style improvements..."
                                    className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}

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
                                disabled={loading}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate'
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
                                Preview
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
                                    Generated content will display here
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper functions to build prompts
function buildComposePrompt(topic: string, length: Length, format: Format, tone: Tone, language: string): string {
    let prompt = `Write content about: "${topic}"\n\n`

    if (length !== 'auto') {
        prompt += `Length: ${length} (${length === 'short' ? '1-2 paragraphs' : length === 'medium' ? '3-4 paragraphs' : '5+ paragraphs'})\n`
    }

    if (format !== 'auto') {
        prompt += `Format: ${format.replace('-', ' ')}\n`
    }

    if (tone !== 'auto') {
        prompt += `Tone: ${tone}\n`
    }

    prompt += `Output language: ${language}\n`
    prompt += `\nPlease write the content directly without any preamble or explanation.`

    return prompt
}

function buildReplyPrompt(originalMessage: string, keyPoints: string, tone: Tone, language: string): string {
    let prompt = `Write a reply to the following message:\n\n"${originalMessage}"\n\n`

    if (keyPoints) {
        prompt += `Include these key points in the reply: ${keyPoints}\n\n`
    }

    if (tone !== 'auto') {
        prompt += `Tone: ${tone}\n`
    }

    prompt += `Output language: ${language}\n`
    prompt += `\nWrite only the reply without any preamble or explanation.`

    return prompt
}

function buildGrammarPrompt(text: string, language: string): string {
    return `Please check the following text for grammar, spelling, punctuation, and style improvements. Provide the corrected version and briefly list the changes you made.\n\nText to check:\n"${text}"\n\nOutput language: ${language}\n\nProvide:\n1. Corrected text\n2. List of corrections made`
}
