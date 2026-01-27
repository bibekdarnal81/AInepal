'use client';

import { Database, Server, Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import NetworkDiagramSVG from '@/components/ui/network-diagram';
import ScaleDiagramSVG from '@/components/ui/scale-diagram';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

const fadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

const staggerContainer = {
    initial: {},
    whileInView: {},
    viewport: { once: true, margin: "-100px" }
};


export function PlatformSection() {
    return (
        <section className="relative py-20 px-3 overflow-hidden bg-background">
            {/* Subtle background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 dot-grid" />
            </div>

            <div className="mx-auto max-w-7xl relative z-10">
                {/* Network and Connect Section */}
                <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start mb-40">

                    {/* Left side - Glowing Rail + Content */}
                    <motion.div className="relative" {...fadeInUp}>
                        {/* Glowing vertical rail */}
                        <div className="absolute left-0 top-0 bottom-0 w-1">
                            <div className="absolute inset-0 bg-gradient-to-b from-teal-600 via-teal-500 to-teal-600/50 rounded-full" />
                            <div className="absolute inset-0 bg-teal-500 rounded-full blur-md opacity-60" />
                            <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-40" />
                            {/* Glowing orb at top */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-400 rounded-full shadow-lg shadow-teal-500/50" />
                            {/* Glowing orb at bottom */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-400 rounded-full shadow-lg shadow-teal-500/50" />
                        </div>

                        {/* Content */}
                        <div className="pl-8 space-y-6">
                            <motion.span
                                className="text-teal-400 text-sm font-medium tracking-wide"
                                {...fadeIn}
                            >
                                Network and Connect
                            </motion.span>

                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-primary leading-tight"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Interconnect your application seamlessly with highly performant networking
                            </motion.h2>

                            <motion.p
                                className="text-muted leading-relaxed"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                AINepal provides automated service discovery, blazing fast
                                networking, and support for any protocol, all out of the box.
                            </motion.p>

                            <motion.a
                                href="#"
                                className="inline-flex items-center gap-2 text-primary font-medium hover:text-teal-500 transition-colors"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                Learn More
                                <span className="text-lg">→</span>
                            </motion.a>

                            {/* Stats row */}
                            <motion.div
                                className="flex items-center gap-6 pt-6 border-t border-border"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-teal-400 font-mono font-semibold">50ms p95</span>
                                    <span className="text-muted text-sm">global network RTT</span>
                                </div>
                            </motion.div>

                            {/* Tech icons row */}
                            <motion.div
                                className="flex items-center gap-4"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <span className="text-muted text-sm">Replaces</span>
                                <div className="flex items-center gap-3">
                                    {/* Placeholder tech icons */}
                                    <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                                        <span className="text-xs text-orange-400">🔥</span>
                                    </div>
                                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                                        <span className="text-xs text-emerald-400">⚡</span>
                                    </div>
                                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                                        <span className="text-xs text-blue-400">N</span>
                                    </div>
                                    <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center">
                                        <span className="text-xs text-yellow-400">▲</span>
                                    </div>
                                    <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                                        <span className="text-xs text-cyan-400">❄</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right side - Network Diagram */}
                    <motion.div
                        className="relative w-full"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <NetworkDiagramSVG />
                    </motion.div>
                </div>


            </div>
        </section>
    );
}
