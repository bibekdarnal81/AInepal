'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check } from 'lucide-react'

interface BuyButtonProps {
    itemType: 'service' | 'course' | 'project'
    itemId: string
    itemTitle: string
    itemSlug?: string
    amount: number
    currency?: string
    className?: string
    children?: React.ReactNode
}

export function BuyButton({
    itemType,
    itemId,
    itemTitle,
    itemSlug,
    amount,
    currency = 'USD',
    className = '',
    children
}: BuyButtonProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handlePurchase = async () => {
        setLoading(true)

        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(window.location.pathname)
            router.push(`/auth/login?return=${returnUrl}`)
            return
        }

        try {
            // Create order
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemType,
                    itemId,
                    itemTitle,
                    itemSlug,
                    amount,
                    currency
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setSuccess(true)

                // Show success message briefly
                setTimeout(() => {
                    // Redirect to dashboard orders
                    router.push('/profile?tab=orders')
                }, 1500)
            } else {
                alert(data.error || 'Failed to create order. Please try again.')
                setLoading(false)
            }
        } catch (error) {
            console.error('Purchase error:', error)
            alert('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    if (success) {
        return (
            <button
                disabled
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium ${className}`}
            >
                <Check className="h-5 w-5" />
                Order Created!
            </button>
        )
    }

    return (
        <button
            onClick={handlePurchase}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 ${className}`}
        >
            {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
                <>
                    <ShoppingCart className="h-5 w-5" />
                    {children || 'Buy Now'}
                </>
            )}
        </button>
    )
}
