'use client'

import { useMemo, useState, type ElementType } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { Check, Info, Minus, HelpCircle, X, Sparkles, Zap, Bot, Box, Globe, Smartphone, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'

type MembershipPlan = {
    id: string
    name: string
    slug: string
    description?: string
    currency: string
    durationDays: number
    price: number
    priceMonthly?: number | null
    priceYearly?: number | null
    yearlyDiscountPercent?: number | null
    discount?: number | null
    features: string[]
    featureCategories?: { categoryName: string; items: { icon?: string; name: string }[] }[]
    advancedCredits?: number
    appIntegrationIcons?: string[]
    platformIcons?: string[]
    badgeText?: string
    iconName?: string | null
    imageUrl?: string | null
}

type Props = {
    plans: MembershipPlan[]
    currentMembershipId: string | null
}

function formatAmount(amount: number) {
    return Number(amount || 0).toLocaleString()
}

export default function MembershipPlans({ plans, currentMembershipId }: Props) {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')

    const getPriceDetails = (plan: MembershipPlan) => {
        const monthlyBase = plan.priceMonthly ?? plan.price
        // If yearly billing, we calculate annual cost.
        // If plan has explicit yearly price, use it. Otherwise apply discount if available.
        const yearlyTotal = plan.priceYearly ?? (
            plan.yearlyDiscountPercent
                ? monthlyBase * 12 * (1 - plan.yearlyDiscountPercent / 100)
                : monthlyBase * 12
        )
        const yearlyPerMonth = yearlyTotal / 12

        return {
            priceDisplay: billing === 'yearly' ? yearlyTotal : monthlyBase,
            perMonthDisplay: billing === 'yearly' ? yearlyPerMonth : monthlyBase,
            originalPrice: billing === 'yearly' && plan.yearlyDiscountPercent ? (monthlyBase * 12) : null,
            savingsPercent: billing === 'yearly' ? plan.yearlyDiscountPercent : 0
        }
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 py-8">
            <div className="text-center mb-12">
                {/* Global Toggle */}
                <div className="inline-flex items-center gap-3 p-1 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 backdrop-blur-sm">
                    <button
                        onClick={() => setBilling('monthly')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${billing === 'monthly' ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBilling('yearly')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${billing === 'yearly' ? 'bg-amber-400 text-black shadow-md' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Yearly <span className="ml-1 text-[10px] opacity-80">(Save up to 50%)</span>
                    </button>
                </div>
            </div>

            <div className={`grid gap-6 ${plans.length > 3 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
                {plans.map((plan) => {
                    const isCurrent = currentMembershipId === plan.id
                    const { priceDisplay, perMonthDisplay, originalPrice, savingsPercent } = getPriceDetails(plan)
                    const planIconName = plan.iconName as keyof typeof Icons | undefined
                    const IconComponent = planIconName && planIconName in Icons ? (Icons[planIconName] as ElementType) : null

                    return (
                        <div
                            key={plan.id}
                            className="relative flex flex-col h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f12] p-6 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 overflow-hidden group shadow-sm dark:shadow-none"
                        >
                            {/* Popular/Discount Badge */}
                            {isCurrent && (
                                <div className="absolute top-0 right-0 z-10">
                                    <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Active Plan
                                    </div>
                                </div>
                            )}
                            {!isCurrent && plan.badgeText && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg transform rotate-0">
                                        {plan.badgeText}
                                    </div>
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {IconComponent ? (
                                        <div className="text-amber-500 dark:text-amber-400">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                    )}
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.currency} {formatAmount(priceDisplay)}</span>
                                    {billing === 'yearly' && <span className="text-sm text-gray-500 dark:text-gray-400">/year</span>}
                                    {billing === 'monthly' && <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>}
                                </div>
                                {originalPrice && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-500 line-through">{plan.currency}{formatAmount(originalPrice)}</span>
                                        {savingsPercent && <span className="text-xs text-green-600 dark:text-green-400">Save {savingsPercent}%</span>}
                                    </div>
                                )}
                                {billing === 'yearly' && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {plan.currency}{formatAmount(perMonthDisplay)}/month
                                    </div>
                                )}
                            </div>

                            {/* Annual Billing Toggle Simulation */}
                            {plan.yearlyDiscountPercent && (
                                <div
                                    className="flex items-center justify-between mb-6 p-2 rounded-lg bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    onClick={() => setBilling(b => b === 'yearly' ? 'monthly' : 'yearly')}
                                >
                                    <span className="text-xs text-indigo-600 dark:text-indigo-300">Save {plan.yearlyDiscountPercent}% with annual billing</span>
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${billing === 'yearly' ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${billing === 'yearly' ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="mb-8">
                                {isCurrent ? (
                                    <button disabled className="w-full py-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-sm font-bold cursor-default flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" /> Current Plan
                                    </button>
                                ) : (
                                    (plan.price === 0 || plan.slug === 'free') ? (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch('/api/user/membership/switch-free', { method: 'POST' })
                                                    if (res.ok) {
                                                        window.location.reload()
                                                    } else {
                                                        alert('Failed to activate free plan')
                                                    }
                                                } catch (e) {
                                                    alert('Error activating plan')
                                                }
                                            }}
                                            className="block w-full py-2.5 rounded-lg text-center text-sm font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white cursor-pointer"
                                        >
                                            Activate Now
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/checkout/memberships/${plan.slug}?billing=${billing}`}
                                            className={`block w-full py-2.5 rounded-lg text-center text-sm font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] ${plan.name.toLowerCase().includes('max') || plan.name.toLowerCase().includes('pro')
                                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                : 'bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            Subscribe Now
                                        </Link>
                                    )
                                )}
                            </div>

                            {/* Features */}
                            <div className="flex-1 space-y-6">
                                {/* Feature Categories */}
                                {(plan.featureCategories || []).map((cat, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {cat.categoryName}
                                            <Info className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                                        </div>
                                        <div className="space-y-2">
                                            {cat.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    {item.icon ? (
                                                        (item.icon.startsWith('/') || item.icon.startsWith('http')) ? (
                                                            <img src={item.icon} alt="" className="w-5 h-5 object-contain" />
                                                        ) : (item.icon && item.icon in Icons) ? (
                                                            <div className="text-gray-400">
                                                                {(() => {
                                                                    const iconName = item.icon as keyof typeof Icons
                                                                    const IconCmp = Icons[iconName] as ElementType
                                                                    return <IconCmp className="w-4 h-4" />
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <span className="p-1 rounded bg-gray-100 dark:bg-white/5 text-[10px] text-gray-500 dark:text-gray-300 leading-none">{item.icon.slice(0, 1)}</span>
                                                        )
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                            <Check className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Legacy/Simple Features */}
                                {(!plan.featureCategories || plan.featureCategories.length === 0) && plan.features?.length > 0 && (
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                                                <span className="leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Advanced Credits */}
                                {plan.advancedCredits && (
                                    <div className="pt-2 border-t border-gray-200 dark:border-white/5">
                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                                            <span>Credit Points</span>
                                            <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{plan.advancedCredits.toLocaleString()}</p>
                                    </div>
                                )}

                                {/* App Integrations */}
                                {plan.appIntegrationIcons && plan.appIntegrationIcons.length > 0 && (
                                    <div className="pt-2">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Application Integration
                                            <Info className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.appIntegrationIcons.map((icon, i) => (
                                                (icon.startsWith('/') || icon.startsWith('http')) ? (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden p-1">
                                                        <img src={icon} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div key={i} title={icon} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400">
                                                        {icon.slice(0, 1)}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Platform Icons */}
                                {plan.platformIcons && plan.platformIcons.length > 0 && (
                                    <div className="pt-2">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Cross-platform AI assistant
                                            <Info className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.platformIcons.map((icon, i) => (
                                                (icon.startsWith('/') || icon.startsWith('http')) ? (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden p-1">
                                                        <img src={icon} alt="" className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div key={i} title={icon} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400">
                                                        {icon.slice(0, 1)}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
