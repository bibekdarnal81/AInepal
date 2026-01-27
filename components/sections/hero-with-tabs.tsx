'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Sparkles, TrendingUp } from 'lucide-react';

function HeroBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Light Mode Gradients */}
            <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-400/20 blur-[100px] dark:hidden" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-[100px] dark:hidden" />

            {/* Dark Mode Gradients */}
            <div className="absolute top-[-20%] left-[-10%] hidden h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px] dark:block" />
            <div className="absolute bottom-[-20%] right-[-10%] hidden h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] dark:block" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
    );
}

function CurrencyTicker() {
    const [currency, setCurrency] = useState<'USD' | 'NPR'>('USD');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrency((prev) => (prev === 'USD' ? 'NPR' : 'USD'));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:text-white/50">
                    Starting at
                </span>
                <div className="relative h-6 w-24 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {currency === 'USD' ? (
                            <motion.span
                                key="USD"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex items-center font-bold text-foreground dark:text-white"
                            >
                                रु 1200<span className="text-xs font-normal text-muted-foreground">/mo</span>
                            </motion.span>
                        ) : (
                            <motion.span
                                key="NPR"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex items-center font-bold text-foreground dark:text-white"
                            >
                                रु 1200<span className="text-xs font-normal text-muted-foreground">/mo</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function Highlight({ children }: { children: React.ReactNode }) {
    return (
        <span className="relative inline-block">
            <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                style={{ originX: 0 }}
                className="absolute -bottom-1 left-0 -z-10 h-[30%] w-full bg-cyan-400/30 dark:bg-cyan-500/30"
            />
            {children}
        </span>
    );
}

export default function Hero() {
    // Parallax Logic
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);

    const sx = useSpring(mx, { stiffness: 100, damping: 30 });
    const sy = useSpring(my, { stiffness: 100, damping: 30 });

    const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
    const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);
    const translateX = useTransform(sx, [-0.5, 0.5], [-20, 20]);
    const translateY = useTransform(sy, [-0.5, 0.5], [-15, 15]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mx.set(x);
        my.set(y);
    };

    const handleMouseLeave = () => {
        mx.set(0);
        my.set(0);
    };

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-background px-6 py-24 dark:bg-slate-950 md:px-12 lg:py-32"
        >
            <HeroBackground />

            <div className="container relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-8">
                {/* Left Content */}
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                        </span>
                        AI for Developers • Nepal
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 text-4xl font-bold tracking-tight text-foreground dark:text-white sm:text-5xl md:text-6xl lg:text-7xl"
                    >
                        Build <Highlight>smarter products</Highlight> with{' '}
                        <span className="bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-indigo-400">
                            AI
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-8 max-w-2xl text-lg text-muted-foreground dark:text-white/70 sm:text-xl"
                    >
                        Create chatbots, automation, and AI-powered apps with Next.js. Fast UI,
                        clean APIs, and production-ready infrastructure designed for scale.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
                    >
                        <Link
                            href="/auth/register"
                            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-cyan-500 px-8 font-semibold text-white transition-all hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/25 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                        >
                            <span className="mr-2">Get Started</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/chat"
                            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                            <Play className="h-4 w-4 fill-current opacity-70" />
                            <span>View Demos</span>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-12 flex flex-col items-center gap-4 text-sm text-muted-foreground dark:text-white/40 lg:flex-row"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-8 w-8 rounded-full border-2 border-background dark:border-slate-950 bg-slate-200 dark:bg-slate-800" />
                            ))}
                        </div>
                        <p>Trusted by 2,000+ developers in Nepal</p>
                    </motion.div>
                </div>

                {/* Right Content (3D Card) */}
                <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                    <motion.div
                        style={{
                            rotateX,
                            rotateY,
                            x: translateX,
                            y: translateY,
                            transformStyle: "preserve-3d",
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-10"
                    >
                        {/* Glass container */}
                        <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                            <div className="relative z-10 overflow-hidden rounded-2xl shadow-inner">
                                <Image
                                    src="/ai-human.webp"
                                    alt="AI Assistant Interface"
                                    width={800}
                                    height={600}
                                    priority
                                    className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Scanline Effect */}
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] [background-size:100%_4px,3px_100%]" />
                            </div>
                        </div>

                        {/* Floating Elements (Decorations) */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -left-12 top-1/2 z-20 hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md md:block dark:border-white/10 dark:bg-slate-900/60"
                        >
                            <Sparkles className="h-6 w-6 text-cyan-400" />
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-8 bottom-32 z-20 hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md md:block dark:border-white/10 dark:bg-slate-900/60"
                        >
                            <CurrencyTicker />
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute -right-12 -bottom-6 z-20 hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md md:block dark:border-white/10 dark:bg-slate-900/60"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-foreground dark:text-white">System Online</span>
                            </div>
                        </motion.div>

                    </motion.div>

                    {/* Background Glow for Image */}
                    <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[90px]" />
                </div>
            </div>
        </section>
    );
}
