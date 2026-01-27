'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    let errorMessage = 'An unknow error occurred'

    switch (error) {
        case 'AccessDenied':
            errorMessage = 'Access denied. You do not have permission to sign in.'
            break
        case 'Configuration':
            errorMessage = 'There is a problem with the server configuration.'
            break
        case 'Verification':
            errorMessage = 'The verification link was invalid or has expired.'
            break
        case 'OAuthSignin':
            errorMessage = 'Error in constructing an authorization URL.'
            break
        case 'OAuthCallback':
            errorMessage = 'Error in handling the response from an OAuth provider.'
            break
        case 'OAuthCreateAccount':
            errorMessage = 'Could not create OAuth provider user in the database.'
            break
        case 'EmailCreateAccount':
            errorMessage = 'Could not create email provider user in the database.'
            break
        case 'Callback':
            errorMessage = 'Error in the OAuth callback handler.'
            break
        case 'OAuthAccountNotLinked':
            errorMessage = 'To confirm your identity, sign in with the same account you used originally.'
            break
        case 'EmailSignin':
            errorMessage = 'Check your email address.'
            break
        case 'CredentialsSignin':
            errorMessage = 'Sign in failed. Check the details you provided are correct.'
            break
        default:
            errorMessage = error || 'An unexpected error occurred'
    }

    return (
        <div className="w-full max-w-md text-center">
            <div className="mb-8 flex justify-center">
                <div className="rounded-full bg-red-100 p-3 ring-8 ring-red-50 dark:bg-red-900/20 dark:ring-red-900/10">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">Authentication Error</h1>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm mb-8">
                <p className="text-muted-foreground">{errorMessage}</p>
            </div>

            <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
            </Link>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
