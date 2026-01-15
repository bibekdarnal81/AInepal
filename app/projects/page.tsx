'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ExternalLink, Github, ArrowLeft, Search, Filter, Sparkles, FolderKanban } from 'lucide-react';
import { BuyButton } from '@/components/buy-button';
import * as Icons from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price?: number;
    category_id: string | null;
    tech_stack: string[];
    demo_url: string | null;
    github_url: string | null;
    thumbnail_url: string | null;
    project_categories?: {
        name: string;
        slug: string;
        color: string;
        icon_name: string | null;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon_name: string | null;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch categories
        const { data: categoriesData } = await supabase
            .from('project_categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (categoriesData) {
            setCategories(categoriesData);
        }

        // Fetch all published projects with category info
        const { data: projectsData } = await supabase
            .from('projects')
            .select(`
                *,
                project_categories (
                    name,
                    slug,
                    color,
                    icon_name
                )
            `)
            .eq('is_published', true)
            .order('display_order', { ascending: true });

        if (projectsData) {
            setProjects(projectsData as any);
        }
        setLoading(false);
    };

    const filteredProjects = projects.filter(project => {
        const matchesCategory = selectedCategory === 'all' || project.category_id === selectedCategory;
        const matchesSearch = !searchQuery ||
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tech_stack?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background text-primary selection:bg-primary/20 font-sans">
            <Header />

            <main className="relative pt-24 pb-20 min-h-screen">
                {/* Background Gradients */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border/60 text-muted text-sm font-medium mb-6 backdrop-blur-sm">
                            <FolderKanban className="h-4 w-4" />
                            <span>Our Portfolio</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Impact</span>
                        </h1>
                        <p className="text-lg text-muted max-w-2xl mx-auto">
                            Explore our collection of digital products, client projects, and open-source contributions.
                        </p>
                    </motion.div>

                    {/* Controls Section (Search + Filter) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-12 space-y-6"
                    >
                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                            <input
                                type="text"
                                placeholder="Search by name, technology, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-card border border-border/60 rounded-2xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                            />
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${selectedCategory === 'all'
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-secondary/60 border-border/60 text-muted hover:bg-secondary/80 hover:text-primary hover:border-border'
                                    }`}
                            >
                                All Projects
                            </button>
                            {categories.map((category) => {
                                const IconComponent = category.icon_name && (Icons as any)[category.icon_name]
                                    ? (Icons as any)[category.icon_name]
                                    : Icons.FolderKanban;

                                const projectCount = projects.filter(p => p.category_id === category.id).length;
                                if (projectCount === 0) return null;

                                const isActive = selectedCategory === category.id;

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`group px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-2 ${isActive
                                            ? 'bg-secondary border-border text-primary shadow-lg scale-105'
                                            : 'bg-secondary/60 border-border/60 text-muted hover:bg-secondary/80 hover:text-primary hover:border-border'
                                            }`}
                                        style={isActive ? { borderColor: category.color } : {}}
                                    >
                                        <IconComponent
                                            className={`h-4 w-4 transition-colors ${isActive ? '' : 'grayscale group-hover:grayscale-0'}`}
                                            style={isActive || !isActive ? { color: isActive ? category.color : undefined } : {}}
                                        />
                                        {category.name}
                                        <span className={`text-xs ml-1 ${isActive ? 'text-muted' : 'text-muted'}`}>
                                            {projectCount}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                                <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin-reverse"></div>
                            </div>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-3xl border border-border/60 mx-auto max-w-2xl">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-muted" />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">No projects found</h3>
                            <p className="text-muted">
                                {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : 'This category is empty right now.'}
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
                                className="mt-6 text-blue-400 hover:text-blue-300 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <AnimatePresence>
                                {filteredProjects.map((project) => {
                                    const categoryInfo = project.project_categories as any;

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            key={project.id}
                                            className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-border hover:shadow-xl hover:shadow-black/10 transition-all duration-300 flex flex-col"
                                        >
                                            {/* Thumbnail */}
                                            <Link href={`/projects/${project.slug}`} className="block relative aspect-video w-full overflow-hidden bg-secondary/60 group cursor-pointer">
                                                {project.thumbnail_url ? (
                                                    <img
                                                        src={project.thumbnail_url}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                                                        <Icons.Image className="h-10 w-10 text-muted" />
                                                    </div>
                                                )}

                                                {/* Overlay Category Badge */}
                                                {categoryInfo && (
                                                    <div className="absolute top-4 left-4">
                                                        <span
                                                            className="px-2.5 py-1 text-xs font-semibold rounded-md backdrop-blur-md border border-border/60 shadow-lg"
                                                            style={{
                                                                backgroundColor: `${categoryInfo.color}30`, // 30% opacity
                                                                color: categoryInfo.color,
                                                                borderColor: `${categoryInfo.color}40`
                                                            }}
                                                        >
                                                            {categoryInfo.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Content */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <Link href={`/projects/${project.slug}`}>
                                                    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">
                                                        {project.title}
                                                    </h3>
                                                </Link>

                                                <p className="text-muted text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                                    {project.description || "No description available."}
                                                </p>

                                                {/* Tech Stack */}
                                                {project.tech_stack && project.tech_stack.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {project.tech_stack.slice(0, 3).map((tech: string, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-secondary text-secondary border border-border/60 rounded"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                        {project.tech_stack.length > 3 && (
                                                            <span className="px-2 py-1 text-[10px] text-muted">
                                                                +{project.tech_stack.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                                                    {project.price && project.price > 0 ? (
                                                        <BuyButton
                                                            itemType="project"
                                                            itemId={project.id}
                                                            itemTitle={project.title}
                                                            itemSlug={project.slug}
                                                            amount={project.price}
                                                            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors text-center"
                                                        >
                                                            Purchase Project
                                                        </BuyButton>
                                                    ) : (
                                                        <>
                                                            {project.demo_url && (
                                                                <a
                                                                    href={project.demo_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
                                                                >
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                    View Demo
                                                                </a>
                                                            )}
                                                            {project.github_url && (
                                                                <a
                                                                    href={project.github_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-primary border border-border/60 rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
                                                                >
                                                                    <Github className="h-3.5 w-3.5" />
                                                                    Code
                                                                </a>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
