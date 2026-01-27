"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, ArrowRight, Crown, Lock } from 'lucide-react';
import Link from 'next/link';

type BillingCycle = 'monthly' | 'yearly';

const competitors = [
    { name: 'ChatGPT 5', icon: '🤖', price: ' रु3000/mo' },
    { name: 'Google Gemini 2.5 Pro', icon: '✦', price: ' रु3000 /mo' },
    { name: 'Perplexity Sonar Pro', icon: '🔮', price: ' रु3000/mo' },
    { name: 'Claude Sonnet 4', icon: '🎭', price: ' रु3000/mo' },
    { name: 'Grok 4', icon: '🌀', price: 'रु4400/mo' },
];

const negatives = [
    'Multiple subscriptions to manage - expensive',
    'Constant tab switching',
    'No comparison features',
];

const features = [
    { text: 'All premium AI models & Super Fiesta', hasIcons: true },
    { text: 'Side-by-side comparison', hasIcons: false },
    { text: '3 million tokens/month (Premium models count as 4×)', hasIcons: false },
    { text: 'Instant prompt enhancement and Memory feature', hasIcons: false },
    { text: 'Image generation & Audio transcription', hasIcons: false },
    { text: 'Add on features: Avatars, Games and more', hasIcons: false },
];

// Model icons for the first feature
const modelIcons = ['🤖', '✦', '🐦', '🎭', '🔮', '🌀'];

export function PricingComparison() {
    const [billing, setBilling] = useState<BillingCycle>('yearly');

    return (
        <section className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-950">
            {/* Background glow effects */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute right-0 top-0 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.15),transparent_50%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.2),transparent_50%)]" />
                <div className="absolute right-1/4 top-1/4 h-[400px] w-[400px] bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_50%)] dark:bg-[radial-gradient(circle,rgba(6,182,212,0.15),transparent_50%)]" />
            </div>

            <div className="container mx-auto max-w-7xl px-4">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                        Get 9+ Premium AI Models<br />for Half the Price of One
                    </h2>
                    <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                        <span className="text-lg">🔥</span>
                        Limited time: Save 90% compared to individual subscriptions
                    </div>
                </div>

                <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1.2fr]">
                    {/* Left Card: Individual Subscriptions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Individual AI Subscriptions</h3>
                        <div className="mt-2">
                            <span className="text-4xl font-bold text-emerald-500">रु16400 +</span>
                            <span className="text-xl text-emerald-500/80">/Month</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">What you&apos;re paying now</p>

                        <div className="mt-8 space-y-4">
                            {competitors.map((comp) => (
                                <div key={comp.name} className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{comp.icon}</span>
                                        <span className="text-slate-700 dark:text-slate-200">{comp.name}</span>
                                    </div>
                                    <span className="font-mono text-emerald-500">{comp.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-3">
                            {negatives.map((neg) => (
                                <div key={neg} className="flex items-center gap-3 text-rose-500 dark:text-rose-400">
                                    <X className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">{neg}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* VS Badge */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-bold text-slate-600 shadow-lg dark:border-emerald-500/30 dark:bg-slate-900 dark:text-white dark:shadow-[0_0_40px_rgba(16,185,129,0.3)] lg:h-20 lg:w-20">
                        VS
                    </div>

                    {/* Right Card: AI Nepal */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-2xl dark:border-emerald-500/30 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/50"
                    >
                        {/* Top glow */}
                        <div className="pointer-events-none absolute -top-20 right-0 h-40 w-80 bg-gradient-to-b from-emerald-400/20 to-transparent blur-3xl dark:from-emerald-500/30" />

                        <div className="relative p-8">
                            {/* Header */}
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">AI Nepal</span>
                            </div>

                            {/* Pricing Cards */}
                            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                                {/* Monthly */}
                                <button
                                    type="button"
                                    onClick={() => setBilling('monthly')}
                                    className={`relative rounded-2xl border-2 p-4 text-left transition-all ${billing === 'monthly'
                                        ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">रु 1200</span>
                                                <span className="text-slate-500 dark:text-slate-400">/Month</span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monthly</p>
                                        </div>
                                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${billing === 'monthly'
                                            ? 'border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400'
                                            : 'border-slate-300 dark:border-white/30'
                                            }`}>
                                            {billing === 'monthly' && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Yearly */}
                                <button
                                    type="button"
                                    onClick={() => setBilling('yearly')}
                                    className={`relative rounded-2xl border-2 p-4 text-left transition-all ${billing === 'yearly'
                                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:border-emerald-400 dark:from-emerald-500/20 dark:to-cyan-500/10'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                                        }`}
                                >
                                    {/* Most Popular Badge */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-white dark:text-slate-900">
                                        Most Popular
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-lg text-slate-400 line-through dark:text-slate-500">रु 14400</span>
                                                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">रु 11952.00</span>
                                                <span className="text-slate-500 dark:text-slate-400">/Year</span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                                                    Yearly (Save 17%)
                                                </span>
                                                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                                                    + Quarterly Webinar Access
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${billing === 'yearly'
                                            ? 'border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400'
                                            : 'border-slate-300 dark:border-white/30'
                                            }`}>
                                            {billing === 'yearly' && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Ultimate Promptbook Banner */}
                            <div className="mb-8 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:from-amber-500/10 dark:to-orange-500/10">
                                <Crown className="h-5 w-5 text-amber-500" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Ultimate Promptbook & Community Access
                                </span>
                            </div>

                            {/* Features */}
                            <div className="space-y-4">
                                {features.map((feature) => (
                                    <div key={feature.text} className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                            <span className="text-sm text-slate-700 dark:text-slate-200">{feature.text}</span>
                                        </div>
                                        {feature.hasIcons && (
                                            <div className="flex shrink-0 items-center gap-1">
                                                {modelIcons.map((icon, i) => (
                                                    <span key={i} className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-sm dark:bg-white/10">
                                                        {icon}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Link
                                href="/membership/upgrade"
                                className="group relative mt-8 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40"
                            >
                                <span className="mr-2 text-lg">Get Started Now</span>
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>

                            {/* Footer */}
                            <div className="mt-4 text-center">
                                <p className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Lock className="h-3 w-3" />
                                    Payments are processed by TagMango using Razorpay & Stripe
                                </p>
                                <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                                    By signing up you agree to receive verification emails, account updates and marketing communication related to AIFiesta. You can unsubscribe from marketing emails anytime. Read our{' '}
                                    <Link href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</Link> and{' '}
                                    <Link href="/terms" className="underline hover:text-slate-600 dark:hover:text-slate-300">Terms</Link>.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
