"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ChevronLeft, ArrowRight } from "lucide-react"
import { TOOLS, ToolCategory } from "./tools-data"

export default function ToolsPage() {
    const [searchQuery, setSearchQuery] = useState("")

    // Group tools by category
    const categories: ToolCategory[] = ['Writing & Editing', 'Productivity & Organization', 'Analysis & Content']

    const filteredTools = TOOLS.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-full overflow-y-auto bg-gray-50/50 dark:bg-zinc-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/chat"
                            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                            AI Tools
                        </h1>
                    </div>

                    <div className="relative max-w-md w-full hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-zinc-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                {/* Mobile Search */}
                <div className="sm:hidden relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>

                {filteredTools.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            No tools found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Try searching for something else
                        </p>
                    </div>
                ) : (
                    categories.map(category => {
                        const categoryTools = filteredTools.filter(t => t.category === category)

                        if (categoryTools.length === 0) return null

                        return (
                            <section key={category} className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                    {category}
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {categoryTools.map((tool) => (
                                        <Link
                                            key={tool.id}
                                            href={tool.href}
                                            className="group block"
                                        >
                                            <div className="relative h-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        <tool.icon className="w-6 h-6" />
                                                    </div>
                                                    {tool.isNew && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {tool.name}
                                                </h3>

                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                                    {tool.description}
                                                </p>

                                                <div className="flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                    Try now <ArrowRight className="w-3 h-3 ml-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )
                    })
                )}
            </main>
        </div>
    )
}
