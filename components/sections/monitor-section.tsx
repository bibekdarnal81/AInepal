'use client';

import { motion } from 'framer-motion';

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

// Logging console mockup component
const LogConsole = () => (
    <div className="bg-zinc-900/90 rounded-lg border border-white/10 overflow-hidden">
        {/* Console header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-zinc-900">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-sm text-gray-400 ml-2">Logs</span>
        </div>

        {/* Log entries */}
        <div className="p-4 font-mono text-xs space-y-2 max-h-80 overflow-hidden">
            {[
                { time: '12:34:56.789', level: 'INFO', msg: 'Server started on port 3000', color: 'text-blue-400' },
                { time: '12:34:56.892', level: 'INFO', msg: 'Connected to database', color: 'text-blue-400' },
                { time: '12:34:57.123', level: 'DEBUG', msg: 'Loading configuration...', color: 'text-gray-500' },
                { time: '12:34:57.456', level: 'INFO', msg: 'API routes initialized', color: 'text-blue-400' },
                { time: '12:34:58.001', level: 'WARN', msg: 'Rate limit approaching threshold', color: 'text-yellow-400' },
                { time: '12:34:58.234', level: 'INFO', msg: 'Request: GET /api/users', color: 'text-blue-400' },
                { time: '12:34:58.567', level: 'INFO', msg: 'Response: 200 OK (45ms)', color: 'text-green-400' },
                { time: '12:34:59.890', level: 'ERROR', msg: 'Connection timeout: Redis cluster', color: 'text-red-400' },
                { time: '12:35:00.123', level: 'INFO', msg: 'Retry attempt 1/3...', color: 'text-blue-400' },
                { time: '12:35:00.456', level: 'INFO', msg: 'Connection restored', color: 'text-green-400' },
            ].map((log, i) => (
                <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                >
                    <span className="text-gray-600">{log.time}</span>
                    <span className={`w-12 ${log.color}`}>[{log.level}]</span>
                    <span className="text-gray-300">{log.msg}</span>
                </motion.div>
            ))}
        </div>
    </div>
);

// Metrics chart mockup
const MetricsChart = () => (
    <div className="bg-zinc-900/90 rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Response Time (ms)</span>
            <span className="text-xs text-green-400">avg: 45ms</span>
        </div>
        <div className="h-24 flex items-end gap-1">
            {[40, 55, 35, 70, 45, 50, 38, 62, 48, 42, 55, 40, 58, 45, 52, 38, 65, 42, 48, 55].map((height, i) => (
                <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-orange-500/50 to-orange-400/80 rounded-t"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                />
            ))}
        </div>
    </div>
);

export function MonitorSection() {
    return (
        <section className="relative py-32 px-6 overflow-hidden bg-black">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 dot-grid" />
            </div>

            <div className="mx-auto max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Content */}
                    <motion.div className="space-y-6" {...fadeInUp}>
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-20 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                            <div>
                                <motion.h3 className="text-orange-400 font-semibold mb-2" {...fadeIn}>
                                    Monitor and Observe
                                </motion.h3>
                                <motion.h2
                                    className="text-3xl md:text-4xl font-bold text-white"
                                    {...fadeInUp}
                                    transition={{ delay: 0.1 }}
                                >
                                    Fix code faster with fully configurable observability
                                </motion.h2>
                            </div>
                        </div>

                        <motion.p
                            className="text-gray-400 leading-relaxed ml-4"
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                        >
                            Rusha provides precise logging, metrics, alerting, profiles, traces,
                            and trend inspection without any code changes.
                        </motion.p>

                        <motion.a
                            href="#"
                            className="inline-flex items-center gap-2 text-white font-medium hover:text-orange-300 transition-colors ml-4"
                            {...fadeInUp}
                            transition={{ delay: 0.3 }}
                        >
                            Learn More
                            <span className="text-lg">→</span>
                        </motion.a>

                        {/* Replaces icons */}
                        <motion.div
                            className="flex items-center gap-4 ml-4 pt-4"
                            {...fadeInUp}
                            transition={{ delay: 0.4 }}
                        >
                            <span className="text-gray-500 text-sm">Replaces</span>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                                    <span className="text-xs text-orange-400">D</span>
                                </div>
                                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-xs text-blue-400">G</span>
                                </div>
                                <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                                    <span className="text-xs text-purple-400">S</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right - Visualization */}
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <MetricsChart />
                        <LogConsole />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
