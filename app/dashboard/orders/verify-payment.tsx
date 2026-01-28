'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function VerifyPayment() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [verifying, setVerifying] = useState(false)

    useEffect(() => {
        const data = searchParams.get('data')
        if (data && !verifying) {
            verify(data)
        }
    }, [searchParams])

    const verify = async (encodedData: string) => {
        setVerifying(true)
        try {
            const res = await fetch('/api/payment/esewa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: encodedData })
            })

            const result = await res.json()

            if (res.ok && result.success) {
                // Success! clear props
                alert('Payment Verified Successfully!')
                router.replace('/dashboard/orders')
                router.refresh()
            } else {
                alert('Payment Verification Failed: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error(error)
            alert('Verification Error')
        } finally {
            setVerifying(false)
        }
    }

    if (!verifying) return null

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-bold">Verifying Payment...</h3>
            <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
        </div>
    )
}
