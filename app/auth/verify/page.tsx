'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, Mail, LayoutDashboard } from 'lucide-react'

function VerifyContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // State
    const [email, setEmail] = useState(searchParams.get('email') || '')
    const [code, setCode] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: code }),
            })

            const data = await response.json()

            if (response.ok) {
                setStatus('success')
                setMessage(data.message || 'Email verified successfully!')
                setTimeout(() => {
                    router.push('/auth/login')
                }, 3000)
            } else {
                setStatus('error')
                setMessage(data.error || 'Verification failed. Please check your code.')
            }
        } catch {
            setStatus('error')
            setMessage('An unexpected error occurred.')
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-card rounded-xl border border-border p-8 shadow-lg max-w-md w-full text-center">
                <div className="flex flex-col items-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Verified!</h2>
                    <p className="text-muted-foreground mb-4">{message}</p>
                    <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg max-w-md w-full">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Verify Account</h1>
                <p className="text-muted-foreground mt-2">Enter the verification information below</p>
            </div>

            {status === 'error' && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-sm text-red-500">{message}</p>
                </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Verification Code</label>
                    <div className="relative">
                        <LayoutDashboard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="000000"
                            maxLength={6}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading' || code.length !== 6 || !email}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {status === 'loading' ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Verifying...
                        </>
                    ) : (
                        'Verify Email'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <Link href="/auth/register" className="text-muted-foreground hover:text-primary transition-colors">
                    Back to Register
                </Link>
                <span className="mx-2 text-border">|</span>
                <Link href="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">
                    Back to Login
                </Link>
            </div>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}>
                <VerifyContent />
            </Suspense>
        </div>
    )
}
