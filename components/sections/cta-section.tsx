'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Zap } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

export function CTASection() {
    return (
        <section className="relative py-32 px-6 overflow-hidden bg-black">
            {/* Gradient background effect */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 dot-grid opacity-10" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-violet-500/20 via-transparent to-transparent opacity-50 blur-3xl" />
            </div>

            <div className="mx-auto max-w-4xl relative z-10">
                {/* Main CTA */}
                <motion.div
                    className="text-center mb-16"
                    {...fadeInUp}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        A better future is now boarding
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Deploy your first project today
                    </p>
                    <motion.a
                        href="#"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        All aboard
                        <ArrowRight className="w-5 h-5" />
                    </motion.a>
                </motion.div>

                {/* Featured cards */}
                <motion.div
                    className="grid md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Launch Week card */}
                    <a
                        href="#"
                        className="group bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/30 flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-violet-400" />
                            </div>
                            <span className="text-sm text-gray-400">Featured</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                            Launch Week 02
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Explore everything we launched—new features, updates, and more.
                        </p>
                    </a>

                    {/* V3 announcement card */}
                    <a
                        href="#"
                        className="group bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-cyan-400" />
                            </div>
                            <span className="text-sm text-gray-400">Blog</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                            Rusha V3: Faster and Cheaper
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Learn how we have simultaneously decreased cost and increased performance.
                        </p>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
