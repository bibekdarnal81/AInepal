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
        quote: " Rusha streamlines and accelerates our entire operation. It gives us instant observability into our services and makes spinning up self-hosted third-party tools almost effortless.",
        name: "Daniel Moretti",
        role: "Co-Founder & CTO at Mappa",
        avatar: "D"
    },
    {
        quote: "Services that took 1 week to configure elsewhere take 1 day to spin up in  Rusha. Messy networking like on other cloud platforms doesn't exist on  Rusha.",
        name: "Daniel Lobaton",
        role: "CTO at G2X",
        avatar: "D"
    },
    {
        quote: " Rusha has been a revelation. We spent ~$100K per year running on AWS - we have since cut that by 90% moving to  Rusha and get a significantly improved developer experience.",
        name: "Antoine Vulcain",
        role: "Founder & CEO at Capitalyze",
        avatar: "A"
    }
];

export function CustomersSection() {
    return (
        <section className="relative py-32 px-6 overflow-hidden bg-black">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 dot-grid" />
            </div>

            <div className="mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    {...fadeInUp}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Trusted by the best in business
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                         Rusha supports great software teams wherever they are. Hear from some of the teams building their products on  Rusha.
                    </p>
                    <motion.a
                        href="#"
                        className="inline-flex items-center gap-2 text-violet-400 font-medium hover:text-violet-300 transition-colors mt-4"
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
                            className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                "{story.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {story.avatar}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{story.name}</p>
                                    <p className="text-gray-500 text-sm">{story.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
