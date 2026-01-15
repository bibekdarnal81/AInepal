'use client'

import { ReactNode, useState } from 'react'
import { Check, Copy, Download, Loader2 } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ToolOutputProps {
    output: string | null
    loading?: boolean
    outputType?: 'text' | 'code' | 'image' | 'structured'
    language?: string
}

export function ToolOutput({ output, loading, outputType = 'text', language = 'javascript' }: ToolOutputProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (output) {
            await navigator.clipboard.writeText(output)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownload = () => {
        if (!output) return

        const blob = new Blob([output], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `output-${Date.now()}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Output</h2>

                {output && !loading && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 text-green-600" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </button>
                    </div>
                )}
            </div>

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Generating your content...</p>
                    </div>
                ) : output ? (
                    <div className="prose prose-slate max-w-none">
                        {outputType === 'code' ? (
                            <SyntaxHighlighter
                                language={language}
                                style={oneDark}
                                customStyle={{
                                    borderRadius: '0.5rem',
                                    padding: '1.5rem',
                                    margin: 0,
                                }}
                                showLineNumbers
                            >
                                {output}
                            </SyntaxHighlighter>
                        ) : outputType === 'structured' ? (
                            <div className="bg-slate-50 rounded-lg p-6">
                                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800">
                                    {output}
                                </pre>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-lg p-6">
                                <div className="whitespace-pre-wrap text-slate-800">
                                    {output}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                        <p>Your generated content will appear here</p>
                    </div>
                )}
            </div>
        </div>
    )
}
