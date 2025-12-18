'use client';

import { GitBranch, Zap, Rocket } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: GitBranch,
        title: 'Connect your repo',
        description: 'Link your GitHub or GitLab repository.  Rusha automatically detects your stack.',
        code: ' Rusha init',
    },
    {
        number: '02',
        icon: Zap,
        title: 'Configure & Deploy',
        description: 'Set environment variables and deploy with a single command. Zero config needed.',
        code: ' Rusha up',
    },
    {
        number: '03',
        icon: Rocket,
        title: 'Shipped',
        description: 'Your app is live with auto-scaling, monitoring, and instant rollbacks built-in.',
        code: '✓ Deployed to production',
    },
];

export function HowItWorksSection() {
    return (
        <section className="relative py-32 px-6 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

            <div className="mx-auto max-w-7xl relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        From code to cloud in{' '}
                        <span className="text-gradient">3 steps</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        The fastest way to go from localhost to production. No DevOps required.
                    </p>
                </div>

                <div className="space-y-16">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.number} className="relative">
                                {/* Connector line */}
                                {idx < steps.length - 1 && (
                                    <div className="absolute left-8 top-24 w-0.5 h-32 bg-gradient-to-b from-purple-500 to-transparent hidden lg:block" />
                                )}

                                <div className="grid lg:grid-cols-2 gap-8 items-center">
                                    {/* Left side - Info */}
                                    <div className={`space-y-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                <Icon className="w-8 h-8 text-purple-400" />
                                            </div>
                                            <span className="text-6xl font-bold text-white/5">{step.number}</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                                        <p className="text-lg text-gray-400 leading-relaxed">{step.description}</p>
                                    </div>

                                    {/* Right side - Code example */}
                                    <div className={`${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                                        <div className="glass rounded-xl p-6 border-gradient">
                                            <div className="font-mono text-sm">
                                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <span className="text-purple-400">$</span>
                                                        <span className="text-gray-300">{step.code}</span>
                                                    </div>
                                                    {idx === 2 ? (
                                                        <>
                                                            <div className="text-green-400 pl-4">{step.code}</div>
                                                            <div className="flex gap-2 mt-2">
                                                                <span className="text-cyan-400">🚀</span>
                                                                <span className="text-gray-300">https://your-app.up. Rusha.app</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-gray-500 pl-4">
                                                            {idx === 0 ? 'Initializing project...' : 'Deploying...'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
