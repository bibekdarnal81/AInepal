'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Globe, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface HostingPlan {
    id: string
    name: string
    slug: string
    storage_gb: number
    bandwidth_text: string
    price: number
    features: string[]
    currency: string
    is_active: boolean
}

export default function HostingDeployPage() {
    const [plans, setPlans] = useState<HostingPlan[]>([])
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [checkingOut, setCheckingOut] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchPlans = async () => {
            const { data, error } = await supabase
                .from('hosting_plans')
                .select('*')
                .eq('is_active', true)
                .order('price', { ascending: true })

            if (error) {
                console.error('Error fetching hosting plans:', error)
            } else if (data) {
                setPlans(data)
            }
            setLoading(false)
        }

        fetchPlans()
    }, [])

    const handleCheckout = async () => {
        if (!selectedPlan) return

        setCheckingOut(true)

        try {
            const plan = plans.find(p => p.id === selectedPlan)
            if (!plan) return

            const response = await fetch('/api/hosting/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId: plan.slug,
                    planName: plan.name,
                    price: plan.price,
                    storage: `${plan.storage_gb} GB`,
                    bandwidth: plan.bandwidth_text
                })
            })

            const data = await response.json()

            if (!response.ok) {
                alert(data.error || 'Failed to create order')
                return
            }

            alert(`Success! Your ${plan.name} hosting order has been created. Check your profile to view the order.`)
            setSelectedPlan(null)
            // Optional: Redirect to profile/orders
            // window.location.href = '/profile?tab=orders'
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Failed to process checkout')
        } finally {
            setCheckingOut(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                            <Globe className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Web Hosting
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Choose the perfect hosting plan for your website
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`
                                        relative bg-card border rounded-2xl p-8
                                        ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                                        ${plan.slug === 'professional' ? 'ring-2 ring-primary/50' : ''}
                                        hover:border-primary/50 transition-all cursor-pointer
                                    `}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    {plan.slug === 'professional' && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-foreground">
                                                {plan.currency === 'NPR' ? 'रू' : '$'} {plan.price.toLocaleString('en-NP')}
                                            </span>
                                            <span className="text-muted-foreground">/month</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <Check className="w-5 h-5 text-primary" />
                                            <span>{plan.storage_gb} GB Storage</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <Check className="w-5 h-5 text-primary" />
                                            <span>{plan.bandwidth_text} Bandwidth</span>
                                        </div>
                                        {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                                                <Check className="w-5 h-5 text-primary" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className={`
                                            w-full py-3 rounded-lg font-medium transition-colors
                                            ${selectedPlan === plan.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-foreground hover:bg-secondary/80'
                                            }
                                        `}
                                    >
                                        {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/projects/new"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Back to deployment options
                        </Link>
                        <button
                            onClick={handleCheckout}
                            disabled={!selectedPlan || checkingOut}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {checkingOut ? 'Processing...' : 'Continue to Checkout'}
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
