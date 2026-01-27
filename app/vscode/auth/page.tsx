"use client"

import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ShieldCheck, Check } from 'lucide-react'

export default function VSCodeAuthPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isAuthorizing, setIsAuthorizing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Params from VS Code
    const redirectUrl = searchParams.get('vscode_open_uri') || searchParams.get('redirect_url') || searchParams.get('redirectUri') || searchParams.get('redirect_uri')

    // Support standard OAuth state param or our custom ones
    const state = searchParams.get('state')

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn(undefined, { callbackUrl: window.location.href })
        }
    }, [status])

    const handleAuthorize = async () => {
        if (!redirectUrl) {
            setError('Missing redirect URL from VS Code')
            return
        }

        setIsAuthorizing(true)
        setError(null)

        try {
            const response = await fetch('/api/vscode/auth/token', {
                method: 'POST',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to generate token')
            }

            const { token } = await response.json()

            // Construct redirect URI
            // If it's a deep link (vscode://...), just append params
            // If it's a callback URL, ensure it is properly formed

            const separator = redirectUrl.includes('?') ? '&' : '?'
            const finalUrl = `${redirectUrl}${separator}token=${token}${state ? `&state=${state}` : ''}`

            setSuccess(true)

            // Short delay to show success state before redirecting
            setTimeout(() => {
                window.location.href = finalUrl
            }, 1000)

        } catch (err: unknown) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Something went wrong')
            setIsAuthorizing(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!session) {
        return null // Will redirect in useEffect
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Authorize VS Code</CardTitle>
                    <CardDescription>
                        Grant the VS Code extension access to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-secondary/50 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Account</span>
                            <span className="font-medium">{session.user?.email}</span>
                        </div>
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 text-center">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {success ? (
                        <Button className="w-full" disabled variant="secondary">
                            <Check className="mr-2 h-4 w-4" /> Redirecting...
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            onClick={handleAuthorize}
                            disabled={isAuthorizing || !redirectUrl}
                        >
                            {isAuthorizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isAuthorizing ? 'Authorizing...' : 'Authorize'}
                        </Button>
                    )}
                    <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
