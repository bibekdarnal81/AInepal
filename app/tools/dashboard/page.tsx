'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Sparkles, Coins } from 'lucide-react'
import * as Icons from 'lucide-react'
import { TOOLS, getAllCategories, type ToolCategory } from '@/lib/tools/tool-config'

export default function ToolsDashboardPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'All'>('All')
    const [tokenBalance, setTokenBalance] = useState(0)

    useEffect(() => {
        fetchTokenBalance()
    }, [])

    const fetchTokenBalance = async () => {
        try {
            const response = await fetch('/api/tokens')
            if (response.ok) {
                const data = await response.json()
                setTokenBalance(data.token_balance || 0)
            }
        } catch (error) {
            console.error('Failed to fetch token balance:', error)
        }
    }

    const filteredTools = TOOLS.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName]
        return IconComponent ? <IconComponent className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />
    }

    const categories = ['All', ...getAllCategories()]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-emerald-600" />
                        <h1 className="text-xl font-bold text-slate-900">AI Suite</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Coins className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-900">{tokenBalance} tokens</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Search and Filter */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find a tool..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category as ToolCategory | 'All')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map((tool) => (
                        <Link
                            key={tool.id}
                            href={`/tools/${tool.slug}`}
                            className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                    {getIcon(tool.icon)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Coins className="h-3 w-3" />
                                    <span>{tool.baseTokenCost}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                {tool.name}
                            </h3>

                            <p className="text-sm text-slate-600 line-clamp-2">
                                {tool.description}
                            </p>

                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                    {tool.category}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredTools.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No tools found matching your search.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
