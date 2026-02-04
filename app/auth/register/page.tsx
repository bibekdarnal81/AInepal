'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { SocialButtons } from '@/components/auth/social-buttons'

export default function RegisterPage() {
    const { data: session, status } = useSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // Verification State
    const [showVerification, setShowVerification] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [verifying, setVerifying] = useState(false)

    const router = useRouter()

    // Redirect logged-in users to dashboard
    useEffect(() => {
        if (status === 'authenticated' && session) {
            router.replace('/dashboard')
        }
    }, [session, status, router])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, displayName }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            setLoading(false)
            setShowVerification(true) // Show the verification modal
            setMessage('Account created! Please enter the code sent to your email.')
        } catch {
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setVerifying(true)
        setError('')

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: verificationCode }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Verification failed')
                setVerifying(false)
                return
            }

            setMessage('Email verified successfully! Redirecting to login...')
            setTimeout(() => {
                router.push('/auth/login')
            }, 2000)
        } catch {
            setError('Verification error occurred')
            setVerifying(false)
        }
    }

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Don't render if authenticated (will redirect)
    if (status === 'authenticated') {
        return null
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">

            {showVerification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-lg p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold">Verify Email</h2>
                            <p className="text-muted-foreground mt-2">Enter the 6-digit code sent to {email}</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 text-center">
                                {error}
                            </div>
                        )}
                        {message && !error && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-500 text-center">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-4">
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full text-center text-2xl font-mono tracking-[0.5em] px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={verifying || verificationCode.length !== 6}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {verifying ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Account'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`w-full max-w-md transition-opacity duration-200 ${showVerification ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
                    <p className="text-muted-foreground">Join us to access courses and services</p>
                </div>

                <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
                    {error && !showVerification && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
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
                            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
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

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    Create Account
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>

                        <SocialButtons />
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div >
    )
}
