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
        <section className="relative py-32 px-6 overflow-hidden bg-black">
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
                            <div className="absolute inset-0 bg-gradient-to-b from-violet-600 via-violet-500 to-violet-600/50 rounded-full" />
                            <div className="absolute inset-0 bg-violet-500 rounded-full blur-md opacity-60" />
                            <div className="absolute inset-0 bg-violet-400 rounded-full blur-xl opacity-40" />
                            {/* Glowing orb at top */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-violet-400 rounded-full shadow-lg shadow-violet-500/50" />
                            {/* Glowing orb at bottom */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-violet-400 rounded-full shadow-lg shadow-violet-500/50" />
                        </div>

                        {/* Content */}
                        <div className="pl-8 space-y-6">
                            <motion.span
                                className="text-violet-400 text-sm font-medium tracking-wide"
                                {...fadeIn}
                            >
                                Network and Connect
                            </motion.span>

                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-white leading-tight"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                Interconnect your application seamlessly with highly performant networking
                            </motion.h2>

                            <motion.p
                                className="text-gray-400 leading-relaxed"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                 NextNepal provides automated service discovery, blazing fast
                                networking, and support for any protocol, all out of the box.
                            </motion.p>

                            <motion.a
                                href="#"
                                className="inline-flex items-center gap-2 text-white font-medium hover:text-violet-300 transition-colors"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                Learn More
                                <span className="text-lg">→</span>
                            </motion.a>

                            {/* Stats row */}
                            <motion.div
                                className="flex items-center gap-6 pt-6 border-t border-zinc-800"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-violet-400 font-mono font-semibold">50ms p95</span>
                                    <span className="text-gray-500 text-sm">global network RTT</span>
                                </div>
                            </motion.div>

                            {/* Tech icons row */}
                            <motion.div
                                className="flex items-center gap-4"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <span className="text-gray-500 text-sm">Replaces</span>
                                <div className="flex items-center gap-3">
                                    {/* Placeholder tech icons */}
                                    <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                                        <span className="text-xs text-orange-400">🔥</span>
                                    </div>
                                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                                        <span className="text-xs text-purple-400">⚡</span>
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

                {/* Scale and Grow Section */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left side - Scaling Visualization */}
                    <motion.div
                        className="relative order-2 lg:order-1"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <ScaleDiagramSVG />
                    </motion.div>

                    {/* Right side - Scale and Grow */}
                    <motion.div
                        className="space-y-8 order-1 lg:order-2"
                        {...fadeInUp}
                    >
                        <div>
                            <motion.h3
                                className="text-cyan-400 font-semibold mb-4"
                                {...fadeIn}
                            >
                                Scale and Grow
                            </motion.h3>
                            <motion.h2
                                className="text-4xl font-bold text-white mb-4"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                            >
                                Scale your applications with intuitive vertical and horizontal scaling
                            </motion.h2>
                            <motion.p
                                className="text-gray-400 leading-relaxed mb-4"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                            >
                                 NextNepal dynamically scales highly performant servers, storage, and networking to meet application demands.
                            </motion.p>
                            <motion.a
                                href="#"
                                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-2"
                                {...fadeInUp}
                                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                            >
                                Learn More →
                            </motion.a>
                        </div>

                        {/* Stats */}
                        <motion.div
                            className="glass rounded-lg p-4 font-mono text-sm border border-white/10"
                            {...fadeInUp}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-cyan-400 font-bold">1000 vCPU</span>
                                    <span className="text-gray-400 text-xs">instances</span>
                                </div>
                                <div className="flex gap-1">
                                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">Replicas</span>
                                    <Server className="w-4 h-4 text-gray-400" />
                                    <Database className="w-4 h-4 text-gray-400" />
                                    <Globe className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
