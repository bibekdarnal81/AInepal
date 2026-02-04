'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { SocialButtons } from '@/components/auth/social-buttons'

import { Suspense } from 'react'

function LoginForm() {
    const { data: session, status } = useSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    // Redirect logged-in users
    useEffect(() => {
        if (status === 'authenticated' && session) {
            if (session.user?.isAdmin) {
                router.replace('/admin')
            } else {
                router.replace('/dashboard')
            }
        }
    }, [session, status, router])

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Don't render form if authenticated (will redirect)
    if (status === 'authenticated') {
        return null
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                if (result.error === 'Email not verified. Please check your inbox.') {
                    // Redirect to verify page with email prefilled
                    setError('Email not verified. Redirecting to verification...')
                    setTimeout(() => {
                        router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
                    }, 1500)
                } else {
                    setError(result.error)
                }
                setLoading(false)
            } else if (result?.ok) {
                // Fetch session to check if admin
                const response = await fetch('/api/auth/session')
                const session = await response.json()

                if (session?.user?.isAdmin) {
                    router.push('/admin')
                } else {
                    router.push(callbackUrl)
                }
                router.refresh()
            }
        } catch {
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-primary hover:text-primary/80"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>

                    <SocialButtons />
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
