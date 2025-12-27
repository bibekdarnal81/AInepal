'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Server, Shield, Zap, Database, Globe, Cpu } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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

export default function HostingPage() {
    const [plans, setPlans] = useState<HostingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'shared' | 'vps' | 'dedicated'>('shared')
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
    const supabase = createClient()

    useEffect(() => {
        const fetchPlans = async () => {
            const { data } = await supabase
                .from('hosting_plans')
                .select('*')
                .eq('is_active', true)
                .order('price', { ascending: true })

            if (data) {
                setPlans(data as any)
            }
            setLoading(false)
        }

        fetchPlans()
    }, [])

    const filteredPlans = plans.filter(plan => (plan.type || 'shared') === activeTab)

    const tabContent = {
        shared: {
            title: "Shared Hosting",
            description: "Perfect for starting your journey. Affordable, reliable, and easy to manage.",
            icon: Globe
        },
        vps: {
            title: "VPS Hosting",
            description: "More power, more control. Dedicated resources for growing businesses.",
            icon: Server
        },
        dedicated: {
            title: "Dedicated Server",
            description: "Maximum performance and security. Your own physical server.",
            icon: Database
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <div className="pt-24 pb-20">
                {/* Hero Section */}
                <div className="container mx-auto px-4 mb-20">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
                            Premium Web Hosting Solutions
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            blazing fast speeds, ironclad security, and 24/7 expert support.
                            Choose the perfect home for your website.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4 mb-16">
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                            {(['shared', 'vps', 'dedicated'] as const).map((tab) => {
                                const Icon = tabContent[tab].icon
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="capitalize">{tab}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col items-center mb-12 gap-6">
                        <h2 className="text-3xl font-bold">{tabContent[activeTab].title}</h2>
                        <p className="text-gray-400 max-w-2xl text-center">{tabContent[activeTab].description}</p>

                        {/* Billing Toggle */}
                        <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'yearly'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Yearly
                                <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded text-white">Save 2 months</span>
                            </button>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                            <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No plans available</h3>
                            <p className="text-gray-400">
                                We currently don't have any active {activeTab} hosting plans.
                                Please check back later or contact us for custom solutions.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {filteredPlans.map((plan, idx) => (
                                <div
                                    key={plan.id}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                                    <div className="relative h-full bg-gray-900 border border-white/10 rounded-xl p-8 hover:border-white/20 transition-colors flex flex-col">
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold text-blue-400">
                                                    रू {(billingCycle === 'yearly' ? (plan.price_yearly || plan.price * 10) : plan.price).toLocaleString('en-NP')}
                                                </span>
                                                <span className="text-gray-400">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                                            </div>
                                            {billingCycle === 'yearly' && (
                                                <div className="mt-2 text-sm text-green-400">
                                                    Equivalent to रू {Math.round((plan.price_yearly || plan.price * 10) / 12).toLocaleString()} /mo
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 mb-8 flex-1">
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Database className="w-5 h-5 text-blue-500" />
                                                <span><strong>{plan.storage_gb} GB</strong> Storage</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Zap className="w-5 h-5 text-yellow-500" />
                                                <span><strong>{plan.bandwidth_text}</strong> Bandwidth</span>
                                            </div>
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3 text-gray-300">
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Link
                                            href={`/checkout/hosting/${plan.slug}?billing=${billingCycle}`}
                                            className="block w-full py-3 text-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="container mx-auto px-4 py-20 border-t border-white/10">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
                            <p className="text-gray-400">
                                Advanced security measures and 99.9% uptime guarantee to keep your site safe and online.
                            </p>
                        </div>
                        <div>
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Cpu className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">High Performance</h3>
                            <p className="text-gray-400">
                                Powered by latest generation hardware and NVMe SSDs for lightning fast load times.
                            </p>
                        </div>
                        <div>
                            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
                            <p className="text-gray-400">
                                Our expert support team is always available to help you with any issues or questions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
