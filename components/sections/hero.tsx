import React from 'react'; // Explicit React import for Next.js if needed, usually mostly optional in new versions but safer for "complete component" request
import { ArrowRight, Sparkles, Command } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#050505] selection:bg-indigo-500/30">

            {/* --- Background Elements --- */}

            {/* 1. Dot Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* 2. Ambient Gradient Blobs (Cloud effect) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Top Center - Indigo/Violet */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />

                {/* Top Right - Fuchsia */}
                <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/15 rounded-full blur-[100px] mix-blend-screen animate-blob delay-2000" />

                {/* Bottom Left - Blue/Purple */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[100px] mix-blend-screen animate-blob delay-4000" />
            </div>

            {/* 3. Vignette Overlay for focus */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80 pointer-events-none" />


            {/* --- Main Content --- */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 cursor-default">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-gray-300 tracking-wide">
                            New: Global Edge Network 2.0
                        </span>
                    </div>
                </div>

                {/* Headline */}
                <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <span className="block mb-2">Infrastructure for</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 animate-gradient-flow bg-[length:200%_auto]">
                        high-scale ambition.
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    Deploy full-stack applications in seconds. No config, just code.
                    Scale from zero to millions of users with a platform designed for growth.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Link href="/deploy">
                        <button className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Deploying
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </Link>

                    <Link href="/docs">
                        <button className="group px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-medium text-lg backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
                            <span className="flex items-center gap-2">
                                <Command className="w-4 h-4 text-gray-400" />
                                Documentation
                            </span>
                        </button>
                    </Link>
                </div>

            </div>

            {/* --- Optional: Floating UI Elements / Parallax Foreground --- */}
            {/* Used to add depth without being distracting */}
            <div className="absolute top-1/2 left-10 hidden lg:block -translate-y-1/2 w-64 p-4 rounded-xl border border-white/5 bg-black/20 backdrop-blur-md animate-float-slow">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                    <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                </div>
            </div>

            <div className="absolute bottom-20 right-20 hidden lg:block w-48 p-3 rounded-lg border border-indigo-500/20 bg-indigo-900/10 backdrop-blur-md animate-float-medium">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    Build completed (23ms)
                </div>
            </div>

        </section>
    );
}
