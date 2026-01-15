'use client'

import { AiModel } from '@/lib/types/ai-models'
import { TOOLS, getAllCategories, getToolsByCategory } from '@/lib/tools/tool-config'
import Link from 'next/link'
import { useState } from 'react'
import {
    Code2,
    FileText,
    Image as ImageIcon,
    Mail,
    MessageSquare,
    Sparkles,
    Sun,
    Settings,
    LayoutGrid,
    Send,
    ChevronDown,
} from 'lucide-react'
import * as Icons from 'lucide-react'

const iconMap = {
    MessageSquare,
    Code2,
    Image: ImageIcon,
    FileText,
    Mail,
}

const getIcon = (icon?: string | null) => {
    if (!icon) return Sparkles
    return (iconMap as Record<string, typeof Sparkles>)[icon] || Sparkles
}

export function AiWorkspacePage({ models }: { models: AiModel[] }) {
    const [selectedModel, setSelectedModel] = useState<AiModel | null>(models[0] || null)
    const [message, setMessage] = useState('')
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
    const [loading, setLoading] = useState(false)
    const [showModelDropdown, setShowModelDropdown] = useState(false)

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedModel || loading) return

        const userMessage = message.trim()
        setMessage('')
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            const response = await fetch('/api/ai-workspace/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelId: selectedModel.id,
                    messages: [
                        ...chatHistory,
                        { role: 'user', content: userMessage }
                    ]
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                throw new Error(errorData.error || errorData.details || 'Failed to get response')
            }

            const data = await response.json()
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.content }])
        } catch (error) {
            console.error('Error:', error)
            let errorMessage = 'Sorry, I encountered an error. '

            if (error instanceof Error) {
                if (error.message.includes('API key not configured')) {
                    errorMessage = '⚠️ API key not configured for this provider. Please go to Admin > AI Models and add an API key for ' + selectedModel.display_name + '.'
                } else if (error.message.includes('not found') || error.message.includes('inactive')) {
                    errorMessage = '⚠️ This model is not available. Please select a different model or activate it in the admin panel.'
                } else {
                    errorMessage += error.message
                }
            }

            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: errorMessage
            }])
        } finally {
            setLoading(false)
        }
    }

    const getProviderColor = (provider: string) => {
        const colors: Record<string, string> = {
            openai: 'text-emerald-500',
            anthropic: 'text-amber-500',
            google: 'text-blue-500',
            deepseek: 'text-purple-500',
        }
        return colors[provider] || 'text-gray-500'
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
                    <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            AI Suite
                        </div>
                        <button type="button" className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>

                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                            <LayoutGrid className="h-4 w-4" />
                            Dashboard
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-6">
                        <div className="space-y-6">
                            {/* AI Tools by Category */}
                            {getAllCategories().map((category) => {
                                const categoryTools = getToolsByCategory(category)
                                if (categoryTools.length === 0) return null

                                return (
                                    <div key={category} className="space-y-1">
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 mb-2">{category}</h3>
                                        {categoryTools.map((tool) => {
                                            const IconComponent = (Icons as any)[tool.icon] || Sparkles
                                            return (
                                                <Link
                                                    key={tool.id}
                                                    href={`/tools/${tool.slug}`}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors group"
                                                >
                                                    <IconComponent className="h-4 w-4 group-hover:text-emerald-600" />
                                                    <span className="flex-1 truncate">{tool.name}</span>
                                                    <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{tool.baseTokenCost}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 px-4 py-4">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <div className="flex items-center justify-between text-xs text-emerald-700">
                                <span className="font-semibold">Balance</span>
                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    PRO
                                </span>
                            </div>
                            <div className="mt-2 text-lg font-semibold text-emerald-800">
                                1,234,850
                                <span className="ml-1 text-xs font-medium text-emerald-600">TOKENS</span>
                            </div>
                            <button className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">

                    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Sparkles className="h-4 w-4 text-emerald-500" />
                                AI Workspace
                            </div>
                            {/* Model Selector */}
                            {models.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                    >
                                        {selectedModel ? (
                                            <>
                                                <span className={getProviderColor(selectedModel.provider)}>●</span>
                                                {selectedModel.display_name}
                                            </>
                                        ) : (
                                            'Select Model'
                                        )}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    {showModelDropdown && (
                                        <div className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-slate-200 bg-white shadow-lg z-10">
                                            {models.map(model => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => {
                                                        setSelectedModel(model)
                                                        setShowModelDropdown(false)
                                                    }}
                                                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${selectedModel?.id === model.id ? 'bg-emerald-50' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{model.display_name}</p>
                                                            <p className="text-xs text-slate-500">{model.description}</p>
                                                        </div>
                                                        <span className={`text-xs font-medium capitalize ${getProviderColor(model.provider)}`}>
                                                            {model.provider}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="button" className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700">
                                <Sun className="h-4 w-4" />
                            </button>
                            <button type="button" className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700">
                                <Settings className="h-4 w-4" />
                            </button>
                            <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-200">
                                Buy now
                            </button>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                                A
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 flex flex-col px-6 py-6">
                        {chatHistory.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                                    What would you like to create?
                                </h1>
                                <p className="mt-3 text-base text-slate-500 sm:text-lg">
                                    {selectedModel
                                        ? `Chat with ${selectedModel.display_name} to generate content, code, and more.`
                                        : 'Select a model to start chatting'}
                                </p>

                                {!selectedModel && models.length === 0 && (
                                    <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                        <p className="text-sm text-yellow-800">
                                            No AI models configured. Please configure models in the admin panel first.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-8 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="relative">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage()
                                                }
                                            }}
                                            disabled={!selectedModel || loading}
                                            className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                                            placeholder={selectedModel ? "Tell me what you need..." : "Select a model first..."}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendMessage}
                                            disabled={!selectedModel || loading || !message.trim()}
                                            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
                                    <button
                                        onClick={() => setMessage("Create a login form with React")}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm hover:border-emerald-200"
                                    >
                                        Auth Login Form
                                    </button>
                                    <button
                                        onClick={() => setMessage("Design a pricing table component")}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm hover:border-emerald-200"
                                    >
                                        Billing Settings
                                    </button>
                                    <button
                                        onClick={() => setMessage("Create a calendar event scheduler")}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm hover:border-emerald-200"
                                    >
                                        Event Scheduler
                                    </button>
                                    <button
                                        onClick={() => setMessage("Build a workspace dashboard")}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm hover:border-emerald-200"
                                    >
                                        Workspace Dashboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                    {chatHistory.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-900'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-pulse text-sm text-slate-500">Thinking...</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                    <div className="relative">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage()
                                                }
                                            }}
                                            disabled={!selectedModel || loading}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                                            placeholder="Type your message..."
                                            rows={3}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendMessage}
                                            disabled={!selectedModel || loading || !message.trim()}
                                            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
