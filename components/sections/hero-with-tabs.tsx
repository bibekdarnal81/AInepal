'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Sparkles, MessageSquare, Image as ImageIcon, Music, Video, Send, Mic, MoreHorizontal, Bot, Brain, Cpu } from 'lucide-react';

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

// --- Feature Visualizations ---

const ChatPreview = () => (
    <div className="flex flex-col h-full justify-between p-6">
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">U</div>
                <div className="bg-secondary/50 rounded-2xl rounded-tl-none p-3 text-sm max-w-[80%]">
                    Write a python script to parse a CSV file.
                </div>
            </div>
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white p-1">
                    <Sparkles className="h-4 w-4" />
                </div>
                <div className="bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl rounded-tr-none p-4 text-sm max-w-[90%] border border-cyan-500/20">
                    <p className="mb-2 text-cyan-700 dark:text-cyan-300 font-medium">Here&apos;s a simple script:</p>
                    <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                        <span className="text-purple-400">import</span> csv<br />
                        <br />
                        <span className="text-purple-400">with</span> open(<span className="text-green-400">&apos;data.csv&apos;</span>) <span className="text-purple-400">as</span> f:<br />
                        &nbsp;&nbsp;reader = csv.reader(f)<br />
                        &nbsp;&nbsp;<span className="text-purple-400">for</span> row <span className="text-purple-400">in</span> reader:<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;print(row)
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4 relative">
            <input
                type="text"
                placeholder="Ask anything..."
                className="w-full bg-background/50 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                readOnly
            />
            <div className="absolute right-1 top-1 h-7 w-7 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                <Send className="h-3 w-3" />
            </div>
        </div>
    </div>
);

const ImagePreview = () => (
    <div className="relative h-full w-full p-4 flex flex-col">
        <div className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10">
            Prompt: Futuristic Kathmandu City, Cyberpunk, 8k
        </div>
        <div className="flex-1 rounded-xl overflow-hidden relative shadow-lg group">
            <Image
                src="/ai-human.webp" // Reusing distinct image
                alt="AI Generated"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 right-4 flex gap-2">
                <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors border border-white/10">
                    <MoreHorizontal className="h-4 w-4 text-white" />
                </button>
                <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/20">
                    Upscale
                </button>
            </div>
        </div>
        <div className="h-1 bg-secondary mt-4 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-cyan-500"
            />
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>Generating variant 4...</span>
            <span>00:02.4s</span>
        </div>
    </div>
);

const AudioPreview = () => (
    <div className="flex flex-col h-full justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />

        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                    <Music className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-bold text-foreground">Midnight Jazz</h4>
                    <p className="text-xs text-muted-foreground">AI Generated • Lo-Fi</p>
                </div>
            </div>
            <div className="text-xs font-mono text-cyan-500">02:14</div>
        </div>

        {/* Waveform Visualization */}
        <div className="flex items-center justify-center gap-1 h-32 mb-8">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ height: [20, (Math.sin(i) * 30 + 50), 20] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                    className="w-2 rounded-full bg-gradient-to-t from-cyan-500 to-indigo-500 opacity-80"
                />
            ))}
        </div>

        <div className="flex justify-center gap-6 items-center">
            <button className="text-muted-foreground hover:text-foreground"><Mic className="h-5 w-5" /></button>
            <button className="h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                <div className="h-4 w-4 bg-background rounded-sm" /> {/* Stop/Pause icon */}
            </button>
            <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-5 w-5" /></button>
        </div>
    </div>
);

const VideoPreview = () => (
    <div className="relative h-full w-full bg-black rounded-lg overflow-hidden flex items-center justify-center group">
        <Image
            src="/ai-human.webp"
            alt="Video Generation"
            fill
            className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-110 transition-transform cursor-pointer">
                <Play className="h-6 w-6 text-white fill-current ml-1" />
            </div>
        </div>

        {/* Video UI Overlays */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="h-1 bg-white/20 rounded-full mb-2 overflow-hidden">
                <div className="h-full w-1/3 bg-cyan-500 rounded-full" />
            </div>
            <div className="flex justify-between text-white/70 text-xs">
                <div className="flex gap-3">
                    <Play className="h-3 w-3 fill-current" />
                    <span>00:12 / 00:45</span>
                </div>
                <span>AI Video Generator v2.0</span>
            </div>
        </div>
    </div>
);


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

    // Tabs Logic
    const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'audio' | 'video'>('chat');

    useEffect(() => {
        const tabs: ('chat' | 'image' | 'audio' | 'video')[] = ['chat', 'image', 'audio', 'video'];
        const interval = setInterval(() => {
            setActiveTab(current => {
                const currentIndex = tabs.indexOf(current);
                return tabs[(currentIndex + 1) % tabs.length];
            });
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const tabs = [
        { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'bg-indigo-500' },
        { id: 'image', label: 'Image', icon: ImageIcon, color: 'bg-cyan-500' },
        { id: 'audio', label: 'Audio', icon: Music, color: 'bg-purple-500' },
        { id: 'video', label: 'Video', icon: Video, color: 'bg-pink-500' },
    ];

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
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left z-20">
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
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="mb-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium text-muted-foreground">
                            <Bot className="h-4 w-4 text-emerald-500" /> <span>GPT-4</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium text-muted-foreground">
                            <Brain className="h-4 w-4 text-orange-500" /> <span>Claude 3</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium text-muted-foreground">
                            <Cpu className="h-4 w-4 text-blue-500" /> <span>Llama 3</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-purple-500" /> <span>Gemini</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
                    >
                        <Link
                            href="/chat"
                            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-cyan-500 px-8 font-semibold text-white transition-all hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/25 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                        >
                            <span className="mr-2">Get Started</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                <div className="relative mx-auto w-full max-w-lg lg:max-w-none perspective-1000">
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
                        {/* Tab Buttons - Floating Above */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 flex gap-2 p-1 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-xl">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-white text-black shadow-lg scale-105'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-current' : ''}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Glass container */}
                        <div className="group relative h-[450px] w-full overflow-hidden rounded-3xl border border-white/20 bg-slate-950/40 p-1 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 transition-all duration-500">

                            {/* Inner Content Area */}
                            <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-slate-900/50 shadow-inner">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.4 }}
                                        className="h-full w-full"
                                    >
                                        {activeTab === 'chat' && <ChatPreview />}
                                        {activeTab === 'image' && <ImagePreview />}
                                        {activeTab === 'audio' && <AudioPreview />}
                                        {activeTab === 'video' && <VideoPreview />}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Scanline Overlay */}
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] [background-size:100%_4px,3px_100%] z-20 opacity-20" />
                            </div>
                        </div>

                        {/* Floating Elements (Decorations) - Updated positions */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -left-8 top-20 z-20 hidden rounded-2xl border border-white/20 bg-white/10 p-3 shadow-xl backdrop-blur-md md:block"
                        >
                            <Sparkles className="h-5 w-5 text-cyan-400" />
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute -right-6 bottom-20 z-20 hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md md:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-white">System Online</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Background Glow */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className={`absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] opacity-40 ${activeTab === 'chat' ? 'bg-indigo-500/30' :
                                activeTab === 'image' ? 'bg-cyan-500/30' :
                                    activeTab === 'audio' ? 'bg-purple-500/30' :
                                        'bg-pink-500/30'
                                }`}
                        />
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
