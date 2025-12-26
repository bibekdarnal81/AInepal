'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, Database, Boxes, Container, Workflow, Cloud,
    Terminal, Layers, Cpu, Globe, Braces, Wrench
} from 'lucide-react';

const categories = [
    { id: 'all', label: 'All Technologies' },
    { id: 'frameworks', label: 'Frameworks' },
    { id: 'languages', label: 'Languages' },
    { id: 'tools', label: 'Tools & DevOps' },
    { id: 'databases', label: 'Databases' }
];

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
];

export function TechStackSection() {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredTechnologies = activeCategory === 'all'
        ? technologies
        : technologies.filter(tech => tech.category === activeCategory);

    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Our Technology <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Stack</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        We use simple, reliable and scalable technologies to build your product.
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category.id
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Tech Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredTechnologies.map((tech) => {
                            const Icon = tech.icon;
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    key={tech.name}
                                    className="group relative bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 backdrop-blur-sm"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="px-2 py-1 rounded-md bg-secondary text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                            {tech.category}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {tech.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {tech.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
