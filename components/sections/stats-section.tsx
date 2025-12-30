'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Animated counter component
const AnimatedCounter = ({ value, label }: { value: string; label: string }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        // Simulate counting animation
        const interval = setInterval(() => {
            const chars = value.split('');
            const randomized = chars.map((char, i) => {
                if (char === ',' || char === ' ') return char;
                // Randomly change some digits for animation effect
                if (Math.random() > 0.7) {
                    return Math.floor(Math.random() * 10).toString();
                }
                return char;
            }).join('');
            setDisplayValue(randomized);
        }, 100);

        // Stop after 2 seconds and show final value
        setTimeout(() => {
            clearInterval(interval);
            setDisplayValue(value);
        }, 2000);

        return () => clearInterval(interval);
    }, [value]);

    return (
        <motion.div
            className="flex items-center justify-between py-4 border-b border-white/5 last:border-b-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Label */}
            <div className="flex gap-3">
                {label.split('').map((char, i) => (
                    <div
                        key={i}
                        className="w-8 h-10 bg-zinc-900/80 rounded border border-white/10 flex items-center justify-center text-gray-400 font-mono text-sm tracking-widest"
                    >
                        {char}
                    </div>
                ))}
            </div>

            {/* Value */}
            <div className="flex gap-1">
                {displayValue.split('').map((char, i) => (
                    <div
                        key={i}
                        className={`w-8 h-10 rounded flex items-center justify-center font-mono text-lg ${char === ',' ? 'w-4 text-gray-500' : 'bg-zinc-900/80 border border-white/10 text-white'
                            }`}
                    >
                        {char}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export function StatsSection() {
    const stats = [
        { label: 'USERS', value: '00,00,100' },
        { label: 'SERVICES', value: '0,000,049' },
        { label: 'DEPLOYS', value: '00,000,040' },
        { label: 'REQUESTS', value: '00,000,000,100' },
        { label: 'LOGS', value: '00,000,000,100' },
    ];

    return (
        <section className="relative py-32 px-6 overflow-hidden bg-black">
            {/* Subtle background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 dot-grid" />
            </div>

            <div className="mx-auto max-w-4xl relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        20+ deploys per month{' '}
                        <span className="text-gray-400">(and counting)</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Real-time usage showing totals for users and services, along with 30-day deploys, requests, and logs.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {stats.map((stat, index) => (
                        <AnimatedCounter
                            key={stat.label}
                            label={stat.label}
                            value={stat.value}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
