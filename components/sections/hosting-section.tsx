'use client'

import { useState, useEffect } from 'react'

import { Check, Server, Shield, Database, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface HostingPlan {
    id: string
    name: string
    slug: string
    type: 'shared' | 'vps' | 'dedicated'
    storage_gb: number
    bandwidth_text: string
    price: number
    price_yearly: number
    features: string[]
    is_active: boolean
}

export function HostingSection() {
    const [plans, setPlans] = useState<HostingPlan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('/api/hosting/plans')
                if (response.ok) {
                    const data = await response.json()
                    // Group by type and pick the first one (cheapest, as API sorts by price)
                    const types = ['shared', 'vps', 'dedicated'] as const
                    const showcasePlans = types.map(type =>
                        (data as any[]).find(p => (p.type || 'shared') === type)
                    ).filter(Boolean) as HostingPlan[]

                    setPlans(showcasePlans)
                }
            } catch (error) {
                console.error('Error fetching hosting plans:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [])

    if (loading || plans.length === 0) return null

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl -z-10" />
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-600 mb-4">
                            Premium Hosting Solutions
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Deploy your applications on our high-performance infrastructure.
                            From shared hosting to dedicated servers.
                        </p>
                    </div>
                    <Link
                        href="/hosting"
                        className="group flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                        View All Plans
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group h-full"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
                            <div className="relative h-full bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors flex flex-col">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${plan.type === 'dedicated' ? 'bg-emerald-500/10 text-emerald-500' :
                                            plan.type === 'vps' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-green-500/10 text-green-500'
                                            }`}>
                                            {plan.type === 'dedicated' ? <Database className="w-6 h-6" /> :
                                                plan.type === 'vps' ? <Server className="w-6 h-6" /> :
                                                    <Shield className="w-6 h-6" />}
                                        </div>
                                        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                            {plan.type}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-primary">
                                                रू {plan.price.toLocaleString('en-NP')}
                                            </span>
                                            <span className="text-muted-foreground">/mo</span>
                                        </div>
                                        {plan.price_yearly && (
                                            <span className="text-xs text-green-500 mt-1">
                                                or रू {Math.round(plan.price_yearly / 12).toLocaleString()} /mo yearly
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Database className="w-4 h-4 text-primary" />
                                        <span><strong>{plan.storage_gb} GB</strong> Storage</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Server className="w-4 h-4 text-primary" />
                                        <span><strong>{plan.bandwidth_text}</strong> Bandwidth</span>
                                    </div>
                                    {plan.features.slice(0, 3).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-muted-foreground">
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="line-clamp-1">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={`/hosting?type=${plan.type}`}
                                    className="block w-full py-3 text-center bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Explore Plans
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
