'use client';

import { motion } from 'framer-motion';
import {
    Code2, Database, Boxes, Container, Workflow, Cloud,
    Terminal, Layers, Cpu, Globe, Braces, Wrench,
    CloudLightning, Droplet, Server
} from 'lucide-react';

const technologies = [
    // Frameworks
    { name: 'Next.js', icon: Globe, category: 'frameworks', description: 'The React Framework for the Web' },
    { name: 'React', icon: Code2, category: 'frameworks', description: 'Library for web and native user interfaces' },
    { name: 'Node.js', icon: Boxes, category: 'frameworks', description: 'JavaScript runtime built on Chrome\'s V8' },
    { name: 'Tailwind CSS', icon: Layers, category: 'frameworks', description: 'Utility-first CSS framework' },

    // Languages
    { name: 'TypeScript', icon: Braces, category: 'languages', description: 'JavaScript with syntax for types' },
    { name: 'Python', icon: Code2, category: 'languages', description: 'Programming language that lets you work quickly' },
    { name: 'JavaScript', icon: Braces, category: 'languages', description: 'Lightweight, interpreted, or just-in-time compiled' },
    { name: 'SQL', icon: Database, category: 'languages', description: 'Standard language for accessing databases' },

    // Tools & DevOps
    { name: 'Docker', icon: Container, category: 'tools', description: 'Accelerate how you build, share, and run applications' },
    { name: 'Git', icon: Workflow, category: 'tools', description: 'Distributed version control system' },
    { name: 'Kubernetes', icon: Cloud, category: 'tools', description: 'Production-grade container orchestration' },
    { name: 'VS Code', icon: Terminal, category: 'tools', description: 'Code editing. Redefined.' },

    // Databases
    { name: 'PostgreSQL', icon: Database, category: 'databases', description: 'The World\'s Most Advanced Open Source Relational Database' },
    { name: 'MongoDB', icon: Database, category: 'databases', description: 'The developer data platform' },
    { name: 'Redis', icon: Cpu, category: 'databases', description: 'The open source, in-memory data store' },
    { name: 'Supabase', icon: Database, category: 'databases', description: 'Open Source Firebase Alternative' },

    // Cloud & Hosting
    { name: 'AWS', icon: CloudLightning, category: 'cloud', description: 'Amazon Web Services cloud computing platform' },
    { name: 'Google Cloud', icon: Cloud, category: 'cloud', description: 'Suite of cloud computing services by Google' },
    { name: 'DigitalOcean', icon: Droplet, category: 'cloud', description: 'Simple, scalable cloud computing solutions' },
    { name: 'Vercel', icon: Server, category: 'cloud', description: 'Develop. Preview. Ship.' }
];

export function TechStackSection() {
    // Split technologies into two rows for the slider
    const firstRow = technologies.slice(0, Math.ceil(technologies.length / 2));
    const secondRow = technologies.slice(Math.ceil(technologies.length / 2));

    return (
        <section className="relative py-24 overflow-hidden bg-background/50 backdrop-blur-sm">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 mb-12">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Powered by Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Technology</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Built with the best tools in the industry for performance, scalability, and reliability.
                    </p>
                </div>
            </div>

            <div className="relative flex flex-col gap-8">
                {/* Gradient Masks for Fade Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

                {/* First Row - Left to Right */}
                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-4 md:gap-8 px-4"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            repeat: Infinity,
                            duration: 30,
                            ease: "linear",
                            repeatType: "loop"
                        }}
                    >
                        {[...firstRow, ...firstRow, ...firstRow].map((tech, i) => {
                            const Icon = tech.icon;
                            return (
                                <div key={`${tech.name}-${i}`} className="flex-shrink-0">
                                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 border border-border/50 hover:border-primary/50 transition-colors backdrop-blur-sm group cursor-default">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-foreground whitespace-nowrap">{tech.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Second Row - Right to Left */}
                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-4 md:gap-8 px-4"
                        animate={{ x: [-1000, 0] }}
                        transition={{
                            repeat: Infinity,
                            duration: 35,
                            ease: "linear",
                            repeatType: "loop"
                        }}
                    >
                        {[...secondRow, ...secondRow, ...secondRow].map((tech, i) => {
                            const Icon = tech.icon;
                            return (
                                <div key={`${tech.name}-${i}`} className="flex-shrink-0">
                                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 border border-border/50 hover:border-primary/50 transition-colors backdrop-blur-sm group cursor-default">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-foreground whitespace-nowrap">{tech.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
