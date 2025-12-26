'use client';

import { BookDemoForm } from '@/components/sections/book-demo-form';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';

export default function BookDemoPage() {
    const features = [
        {
            icon: Zap,
            text: "Fast-track your digital transformation"
        },
        {
            icon: ShieldCheck,
            text: "Enterprise-grade security & reliability"
        },
        {
            icon: Star,
            text: "Award-winning design & user experience"
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 pt-20 lg:pt-0">
                <div className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2">

                    {/* Left Column - Content */}
                    <div className="relative bg-zinc-900 text-white p-8 lg:p-16 flex flex-col justify-center overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]" />
                        </div>

                        <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Accepting New Projects
                                </div>

                                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                                    Let's build something <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">extraordinary</span> together.
                                </h1>

                                <p className="text-lg text-zinc-400 mb-10 leading-relaxed font-light">
                                    Ready to elevate your digital presence? Schedule a free consultation with our experts to discuss your vision, requirements, and how we can help you succeed.
                                </p>

                                <div className="space-y-6 mb-12">
                                    {features.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (index * 0.1) }}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-zinc-200">{item.text}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-4">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-600" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex items-center gap-1 text-yellow-400 mb-0.5">
                                                <Star className="h-4 w-4 fill-current" />
                                                <Star className="h-4 w-4 fill-current" />
                                                <Star className="h-4 w-4 fill-current" />
                                                <Star className="h-4 w-4 fill-current" />
                                                <Star className="h-4 w-4 fill-current" />
                                            </div>
                                            <p className="text-zinc-400">Trusted by 50+ businesses</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="bg-background flex flex-col justify-center p-6 lg:p-12 xl:p-16">
                        <div className="max-w-xl mx-auto w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Request Your Demo</h2>
                                    <p className="text-muted-foreground">Fill in the details below and we'll get back to you within 24 hours.</p>
                                </div>

                                <div className="bg-card rounded-2xl border border-border/60 shadow-xl shadow-primary/5 p-6 md:p-8">
                                    <BookDemoForm />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
