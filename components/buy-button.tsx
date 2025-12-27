'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check } from 'lucide-react'

interface BuyButtonProps {
    itemType: 'service' | 'project'
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
        // Redirect to checkout page
        let checkoutUrl = ''

        if (itemType === 'service') {
            // Service uses ID for checkout lookup
            checkoutUrl = `/checkout/services/${itemId}`
        } else if (itemType === 'project') {
            // Project uses Slug for checkout lookup
            checkoutUrl = `/checkout/projects/${itemSlug || itemId}`
        } else {
            // Fallback
            checkoutUrl = `/checkout/${itemType}s/${itemId}`
        }

        router.push(checkoutUrl)
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
