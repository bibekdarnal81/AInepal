'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CREDIT_PACKS = [
    { id: 'starter', name: 'Starter', amount: 50, price: 5, highlight: false },
    { id: 'pro', name: 'Pro', amount: 150, price: 12, highlight: true },
    { id: 'max', name: 'Max', amount: 500, price: 35, highlight: false },
]

export function PurchaseCredits() {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handlePurchase = async (packId: string, amount: number) => {
        try {
            setLoading(packId)
            const res = await fetch('/api/credits/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, packId })
            })
            const data = await res.json()
            if (data.success) {
                router.refresh()
                // Force a reload to update credit balance in header if it's not reactive
                window.location.reload()
            } else {
                alert(data.error || 'Purchase failed')
            }
        } catch (error) {
            console.error('Purchase error:', error)
            alert('Something went wrong')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREDIT_PACKS.map((pack) => (
                <Card key={pack.id} className={`relative flex flex-col ${pack.highlight ? 'border-primary shadow-lg scale-105' : ''}`}>
                    {pack.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                            Most Popular
                        </div>
                    )}
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg font-medium">{pack.name}</CardTitle>
                        <div className="flex justify-center items-baseline gap-1 mt-2">
                            <span className="text-3xl font-bold">${pack.price}</span>
                            <span className="text-muted-foreground">USD</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-xl font-bold">{pack.amount} Credits</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            ~${(pack.price / pack.amount).toFixed(2)} per credit
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant={pack.highlight ? 'default' : 'outline'}
                            disabled={loading !== null}
                            onClick={() => handlePurchase(pack.id, pack.amount)}
                        >
                            {loading === pack.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy Now'}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
