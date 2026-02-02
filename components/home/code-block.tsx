"use client"

import { useState, useEffect } from "react"

import { useCodeSidebar } from "./code-sidebar-provider"
import { Maximize2, Check, Copy } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { cn } from "@/lib/utils"

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
    _node?: unknown
    inline?: boolean
}

export function CodeBlock({ className, children, _node, inline, ...props }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const { openSidebar } = useCodeSidebar()

    useEffect(() => {
        // Initial check safe to run in effect if we accept a flicker or handle it via hydration safe method
        // But to fix the specific lint "Calling setState synchronously within an effect":
        // We can just rely on the observer and an initial check wrapped differently or ignore if false positive
        // However, better pattern:

        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains("dark"))
        }

        checkTheme()

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    checkTheme()
                }
            })
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        })

        return () => observer.disconnect()
    }, [])

    const match = /language-(\w+)/.exec(className || "")
    const language = match ? match[1] : (inline ? "" : "text")
    const code = String(children).replace(/\n$/, "")

    if (inline) {
        return (
            <code className={cn("bg-gray-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-gray-200", className)} {...props}>
                {children}
            </code>
        )
    }

    const onCopy = () => {
        if (!code) return
        navigator.clipboard.writeText(code)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <span className="block relative group rounded-xl overflow-hidden my-6 border border-gray-200 dark:border-zinc-800 shadow-sm bg-gray-50 dark:bg-[#1e1e1e]">
            <span className="flex items-center justify-between px-4 py-2.5 bg-gray-100/50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 backdrop-blur-sm">
                <span className="flex items-center gap-2">
                    <span className="flex gap-1.5">
                        <span className="block w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <span className="block w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <span className="block w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    </span>
                    <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {language || "text"}
                    </span>
                </span>
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => openSidebar(code, language)}
                        className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700/50 text-gray-500 dark:text-gray-400"
                        title="Open in Sidebar"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onCopy}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700/50 text-xs font-medium text-gray-500 dark:text-gray-400"
                        title="Copy code"
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-green-500">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </span>
            <span className="block overflow-x-auto">
                <SyntaxHighlighter
                    language={language}
                    style={isDarkMode ? vscDarkPlus : vs}
                    PreTag="span"
                    customStyle={{
                        margin: 0,
                        padding: "1.25rem",
                        borderRadius: "0",
                        background: "transparent",
                        fontSize: "0.9rem",
                        lineHeight: "1.6",
                        display: "block",
                    }}
                    wrapLines={true}
                // wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </span>
        </span>
    )
}
