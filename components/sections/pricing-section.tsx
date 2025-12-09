'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        name: 'Starter',
        price: '$0',
        period: 'forever',
        description: 'Perfect for side projects and experimentation',
        features: [
            '500 hours execution time',
            '512 MB RAM',
            '1 GB disk',
            'Community support',
            'Hobby projects',
        ],
        cta: 'Start for free',
        highlighted: false,
    },
    {
        name: 'Developer',
        price: '$20',
        period: 'per month',
        description: 'For professional developers and small teams',
        features: [
            'Unlimited execution time',
            '8 GB RAM',
            '100 GB disk',
            'Priority support',
            'Custom domains',
            'Team collaboration',
            'Advanced metrics',
        ],
        cta: 'Start trial',
        highlighted: true,
    },
    {
        name: 'Team',
        price: '$50',
        period: 'per month',
        description: 'For growing teams and production workloads',
        features: [
            'Everything in Developer',
            '32 GB RAM',
            '500 GB disk',
            '24/7 support',
            'SSO & RBAC',
            'Dedicated resources',
            'SLA guarantee',
        ],
        cta: 'Contact sales',
        highlighted: false,
    },
];

export function PricingSection() {
    return (
        <section className="relative py-32 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Simple,{' '}
                        <span className="text-gradient">transparent pricing</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Start for free. Scale when you need to. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative glass rounded-2xl p-8 ${plan.highlighted
                                    ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/20'
                                    : ''
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-purple-pink rounded-full text-xs font-semibold text-white">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                                    <span className="text-gray-400">/ {plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="#signup"
                                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 ${plan.highlighted
                                        ? 'bg-white text-black hover:bg-gray-200'
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400">
                        All plans include SSL, DDoS protection, and automatic backups.{' '}
                        <Link href="#compare" className="text-purple-400 hover:text-purple-300 underline">
                            Compare plans
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
