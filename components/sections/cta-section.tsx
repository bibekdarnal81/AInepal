'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Zap } from 'lucide-react';
import { useState } from 'react';
import { BookDemoModal } from '@/components/site/book-demo-modal';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

export function CTASection() {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    return (
        <section className="relative py-32 px-6 overflow-hidden bg-background">
            <BookDemoModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
            />

            {/* Gradient background effect */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 dot-grid opacity-10" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-50 blur-3xl" />
            </div>

            <div className="mx-auto max-w-4xl relative z-10">
                {/* Main CTA */}
                <motion.div
                    className="text-center mb-16"
                    {...fadeInUp}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                        Ready to Transform Your Business?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 text-balance">
                        See how AINepal can streamline your operations and drive growth. Schedule a personalized demo today.
                    </p>
                    <motion.button
                        onClick={() => setIsDemoModalOpen(true)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-lg shadow-lg shadow-primary/25 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Book a Free Demo
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>

                {/* Featured cards */}
                <motion.div
                    className="grid md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Consultation Card */}
                    <a
                        href="/services"
                        className="group bg-card/50 border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-teal-500" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">Fast Track</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            Growth Consultation
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Get a free analysis of your current digital presence and growth opportunities.
                        </p>
                    </a>

                    {/* Solutions Card */}
                    <a
                        href="/portfolios"
                        className="group bg-card/50 border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">Case Studies</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            See Our Success Stories
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Explore how we've helped other businesses achieve their digital goals.
                        </p>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
