'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: "easeOut" as const }
};

const customerStories = [
    {
        quote: "On our previous rent day, we saw traffic of 1,500+ requests per second that were all being fulfilled in under 50 milliseconds, which is really great. Our technical team is really impressed with scale like that.",
        name: "Kartik Aggarwal",
        role: "Tech Lead at Bilt",
        avatar: "K"
    },
    {
        quote: " AINepal streamlines and accelerates our entire operation. It gives us instant observability into our services and makes spinning up self-hosted third-party tools almost effortless.",
        name: "Daniel Moretti",
        role: "Co-Founder & CTO at Mappa",
        avatar: "D"
    },
    {
        quote: "Services that took 1 week to configure elsewhere take 1 day to spin up in  AINepal. Messy networking like on other cloud platforms doesn't exist on  AINepal.",
        name: "Daniel Lobaton",
        role: "CTO at G2X",
        avatar: "D"
    },
    {
        quote: " AINepal has been a revelation. We spent ~$100K per year running on AWS - we have since cut that by 90% moving to  AINepal and get a significantly improved developer experience.",
        name: "Antoine Vulcain",
        role: "Founder & CEO at Capitalyze",
        avatar: "A"
    }
];

export function CustomersSection() {
    return (
        <section className="relative py-32 px-6 overflow-hidden bg-background">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 dot-grid" />
            </div>

            <div className="mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    {...fadeInUp}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        Trusted by the best in business
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        AINepal supports great software teams wherever they are. Hear from some of the teams building their products on  AINepal.
                    </p>
                    <motion.a
                        href="#"
                        className="inline-flex items-center gap-2 text-teal-500 font-medium hover:text-teal-400 transition-colors mt-4"
                        {...fadeInUp}
                        transition={{ delay: 0.2 }}
                    >
                        Read customer stories →
                    </motion.a>
                </motion.div>

                {/* Customer testimonial cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {customerStories.map((story, i) => (
                        <motion.div
                            key={i}
                            className="bg-card border border-border/60 rounded-xl p-6 hover:border-border transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <p className="text-secondary text-lg leading-relaxed mb-6">
                                "{story.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                    {story.avatar}
                                </div>
                                <div>
                                    <p className="text-primary font-medium">{story.name}</p>
                                    <p className="text-muted text-sm">{story.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
