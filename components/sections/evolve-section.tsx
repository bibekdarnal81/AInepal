'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { ProductionDiagramSVG } from '@/components/ui/production';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

// Glowing Rail Animation - matches Railway's vertical rail
const GlowingRail = () => (
    <div className="relative h-[500px] w-16 flex-shrink-0">
        {/* Main rail track */}
        <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-500/30 via-emerald-500/50 to-emerald-500/10 rounded-full" />

        {/* Glowing center line */}
        <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-transparent rounded-full" />

        {/* Top node */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60">
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
            </div>
        </div>

        {/* Rail details */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-6 h-24 bg-gradient-to-b from-emerald-500/40 to-transparent rounded-t-lg" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-4 h-48 bg-gradient-to-b from-emerald-500/30 to-transparent" />
        <div className="absolute top-80 left-1/2 -translate-x-1/2 w-3 h-32 bg-gradient-to-b from-emerald-500/20 to-transparent" />

        {/* Side glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent blur-xl" />
    </div>
);

export function EvolveSection() {
    return (
        <section className="relative py-24 px-6 overflow-hidden bg-black">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 dot-grid" />
            </div>

            <div className="mx-auto max-w-7xl relative z-10">
                {/* Header Section - Rail + Text Content */}
                <div className="flex gap-8 mb-12">
                    {/* Glowing Rail */}
                    <div className="hidden lg:block">
                        <GlowingRail />
                    </div>

                    {/* Text Content */}
                    <motion.div className="flex-1 max-w-2xl space-y-6" {...fadeInUp}>
                        <span className="text-emerald-400 font-semibold text-lg">
                            Evolve and Collaborate
                        </span>

                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1]">
                            Accelerate development with PR environments, baremetal builds, and automatic infrastructure versioning
                        </h2>

                        <p className="text-gray-400 text-lg leading-relaxed">
                            Seamlessly evolve your infrastructure with forking, automatic versioning, and baremetal for faster-than-cloud build times.{' '}
                            <a href="#" className="text-white font-medium hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
                                Learn More <span>→</span>
                            </a>
                        </p>

                        {/* Stats row */}
                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-emerald-400 font-bold text-xl">50%</span>
                                <span className="text-gray-400">faster builds</span>
                            </div>
                            <div className="h-6 w-px bg-gray-700" />
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">Replaces</span>
                                <div className="flex gap-2">
                                    <div className="w-7 h-7 rounded bg-teal-500/20 flex items-center justify-center text-sm text-teal-400 font-medium">V</div>
                                    <div className="w-7 h-7 rounded bg-blue-500/20 flex items-center justify-center text-sm text-blue-400 font-medium">H</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Environment Diagram - Full Width SVG */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <ProductionDiagramSVG />
                </motion.div>
            </div>
        </section>
    );
}
