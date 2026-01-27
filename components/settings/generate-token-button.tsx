"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Plus, Check, Monitor } from "lucide-react"

export function GenerateTokenButton() {
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const generateToken = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/vscode/auth/token', {
                method: 'POST',
            })
            const data = await response.json()
            if (data.token) {
                setToken(data.token)
            }
        } catch (error) {
            console.error('Failed to generate token', error)
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (token) {
            navigator.clipboard.writeText(token)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-4">
            {!token ? (
                <Button onClick={generateToken} disabled={isLoading} variant="secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? "Generating..." : "Generate New Session Token"}
                </Button>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Copy this token and paste it into the extension. It will not be shown again.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-secondary/50 rounded-lg font-mono text-sm break-all">
                            {token}
                        </code>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={copyToClipboard}
                            className="shrink-0 px-3"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            )}

            <div className="text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-lg flex gap-2">
                <Monitor className="w-4 h-4 text-blue-500 shrink-0" />
                <p>
                    VS Code authentication tokens are valid for 30 days unless revoked.
                </p>
            </div>
        </div>
    )
}
