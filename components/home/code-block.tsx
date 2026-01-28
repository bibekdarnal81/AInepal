"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeBlockProps {
    node?: import("react").ReactNode
    className?: string
    children?: import("react").ReactNode
    style?: import("react").CSSProperties
    [key: string]: unknown
}

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false)
    const match = /language-(\w+)/.exec(className || "")
    const language = match ? match[1] : ""
    const code = String(children).replace(/\n$/, "")

    if (!match) {
        return (
            <code className={className} {...props}>
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
        <div className="relative group rounded-md overflow-hidden my-4 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                    {language || "code"}
                </span>
                <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-xs text-gray-500 dark:text-gray-400"
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
            <div className="overflow-x-auto bg-white dark:bg-[#1e1e1e]">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        borderRadius: "0",
                        background: "transparent",
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    )
}
