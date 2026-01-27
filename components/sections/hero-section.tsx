'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Hero Section -  AINepal-inspired design
 * Clean, minimal, with product mockup and company logos
 */
export function HeroSection() {
    const companyLogos = [
        'Intuit', 'Automattic', 'Bilt', 'Owner', 'Tripadvisor',
        'G2X', 'Apollo', 'Clerk', 'Prisma'
    ];

    return (
        <section className="relative min-h-screen bg-black overflow-hidden">
            {/* Subtle gradient glow at top */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 50% 50% at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">

                {/* Hero Text - Left aligned */}
                <div className="max-w-2xl mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6 animate-fade-in-up">
                        Shipping great products is hard.
                        <br />
                        <span className="text-gradient">Scaling infrastructure is easy.</span>
                    </h1>

                    <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        AINepal simplifies your infrastructure stack from servers to
                        observability with a single, scalable, easy-to-use platform.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Link href="#deploy">
                            <Button
                                size="lg"
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02]"
                            >
                                Deploy a new project
                            </Button>
                        </Link>
                        <Link href="/book-demo">
                            <Button
                                size="lg"
                                variant="ghost"
                                className="border-gray-700 bg-transparent text-white hover:bg-white/5 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                            >
                                Book a demo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Product Tabs */}
                <div className="flex items-center gap-8 mb-8 text-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    {['Deploy', 'Network', 'Scale', 'Monitor', 'Evolve'].map((tab, i) => (
                        <button
                            key={tab}
                            className={`flex items-center gap-2 pb-2 transition-colors ${i === 2
                                ? 'text-teal-400 border-b-2 border-teal-400'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <span className="w-4 h-4 opacity-60">○</span>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Product Mockup */}
                <div className="relative rounded-xl overflow-hidden border border-gray-800/50 bg-gray-950 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    {/* Browser Chrome */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-gray-700" />
                                <div className="w-3 h-3 rounded-full bg-gray-700" />
                                <div className="w-3 h-3 rounded-full bg-gray-700" />
                            </div>
                            <span className="text-xs text-gray-500 ml-4">gravy-truck → production</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Dashboards</span>
                            <span>Observability</span>
                            <span>Logs</span>
                            <span>Settings</span>
                        </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="relative p-8 min-h-[400px]">
                        {/* Dot grid background */}
                        <div className="absolute inset-0 dot-grid opacity-30" />

                        {/* Service Cards */}
                        <div className="relative flex flex-col gap-6 max-w-md mx-auto">
                            {/* Backend Service */}
                            <div className="bg-gray-900/80 border border-teal-500/30 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center">
                                        <span className="text-xs">⬡</span>
                                    </div>
                                    <span className="text-white font-medium">backend</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-1 rounded bg-teal-900/50 text-teal-300">High CPU usage</span>
                                </div>
                            </div>

                            {/* Postgres Service */}
                            <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm ml-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                                        <span className="text-xs">🐘</span>
                                    </div>
                                    <span className="text-white font-medium">postgres</span>
                                </div>
                                <div className="space-y-1 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        1 active connection
                                    </div>
                                    <div className="text-gray-600">pg_data</div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Panel */}
                        <div className="absolute bottom-4 right-4 bg-gray-900/90 border border-gray-800 rounded-lg px-4 py-2 text-xs text-gray-400">
                            Activity ▼
                        </div>
                    </div>
                </div>

                {/* Company Logos */}
                <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
                        {companyLogos.map((logo) => (
                            <span
                                key={logo}
                                className="text-sm font-medium text-gray-400 tracking-wide"
                            >
                                {logo}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Mission Statement */}
            <div className="relative border-t border-gray-900 mt-16">
                {/* Glowing line effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-teal-500/50 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="max-w-lg">
                        <p className="text-gray-400 leading-relaxed mb-6">
                            For too long, deploying cloud infrastructure has been
                            <span className="text-white border-b border-gray-600"> the most painful part</span> of the developer toolchain.
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            We&apos;re working at the intersection of distributed systems
                            engineering and interface design to rebuild every layer
                            of the stack for speed and developer experience.
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            With instant deployments and effortless scale, a better
                            way to deploy applications is now boarding.
                        </p>
                        <p className="text-teal-400 font-medium">
                            Welcome to  AINepal.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
