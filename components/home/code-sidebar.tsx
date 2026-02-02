"use client"

import { useCodeSidebar } from "./code-sidebar-provider"
import { X, Copy, Check, Download, Plus, Sparkles } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useState } from "react"

export function CodeSidebar() {
    const { isOpen, code, language, closeSidebar } = useCodeSidebar()
    const [isCopied, setIsCopied] = useState(false)

    if (!isOpen) return null

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const handleDownload = () => {
        const blob = new Blob([code], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `code.${language || "txt"}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="w-[400px] md:w-[500px] lg:w-[600px] border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full shadow-xl z-40 fixed right-0 top-0 bottom-0 transition-transform duration-300 transform translate-x-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {language || "Text"}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        title="Copy code"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        title="Add to Library"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        title="Download code"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={closeSidebar}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        title="Close sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#1e1e1e]">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: "1.5rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.6",
                        background: "transparent",
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>

            {/* Ad Section */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Upgrade to Pro
                        </h3>
                        <p className="text-purple-100 text-sm mb-3">
                            Get unlimited AI code generations and access to premium models like GPT-4.
                        </p>
                        <button className="w-full py-2 bg-white text-purple-600 font-semibold rounded-lg text-sm hover:bg-purple-50 transition-colors shadow-sm">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
