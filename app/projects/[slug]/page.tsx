'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { BuyButton } from '@/components/buy-button'
import * as Icons from 'lucide-react'

interface Project {
    id: string
    title: string
    slug: string
    description: string | null
    content: string | null
    features: string[] | null
    price: number
    currency: string
    thumbnail_url: string | null
    demo_url: string | null
    github_url: string | null
    tech_stack: string[]
    tags: string[]
    created_at: string
    category_id: string | null
    project_categories?: {
        name: string
        slug: string
        color: string
        icon_name: string | null
    }
}

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params)
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchProject()
    }, [resolvedParams.slug])

    const fetchProject = async () => {
        const { data } = await supabase
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
            .eq('slug', resolvedParams.slug)
            .eq('is_published', true)
            .single()

        if (data) {
            setProject(data as any)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="py-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Project Not Found</h1>
                        <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist or has been removed.</p>
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Projects
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const categoryInfo = project.project_categories as any
    const CategoryIcon = categoryInfo?.icon_name && (Icons as any)[categoryInfo.icon_name]
        ? (Icons as any)[categoryInfo.icon_name]
        : Icons.FolderKanban

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-12">
                <div className="mx-auto max-w-5xl px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>

                    {/* Project Header */}
                    <div className="mb-8">
                        {categoryInfo && (
                            <div className="flex items-center gap-2 mb-4">
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm"
                                    style={{
                                        backgroundColor: `${categoryInfo.color}20`,
                                        color: categoryInfo.color
                                    }}
                                >
                                    <CategoryIcon className="h-4 w-4" />
                                    {categoryInfo.name}
                                </div>
                            </div>
                        )}
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            {project.title}
                        </h1>
                        {project.description && (
                            <p className="text-xl text-muted-foreground">
                                {project.description}
                            </p>
                        )}
                    </div>

                    {/* Project Image */}
                    {project.thumbnail_url && (
                        <div className="aspect-video w-full overflow-hidden rounded-xl bg-secondary mb-8">
                            <img
                                src={project.thumbnail_url}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Project Description */}
                            {project.content && (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">About This Project</h2>
                                    <div className="prose prose-invert max-w-none">
                                        <div 
                                            className="text-muted-foreground leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: project.content }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Features */}
                            {project.features && project.features.length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">Key Features</h2>
                                    <ul className="space-y-3">
                                        {project.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <svg
                                                    className="h-6 w-6 text-primary flex-shrink-0 mt-0.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                <span className="text-muted-foreground leading-relaxed">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tech Stack */}
                            {project.tech_stack && project.tech_stack.length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4">Technologies Used</h2>
                                    <div className="flex flex-wrap gap-3">
                                        {project.tech_stack.map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Tag className="h-5 w-5" />
                                        Tags
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-secondary text-foreground rounded-full text-sm"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-xl p-6 sticky top-6 space-y-6">
                                {/* Price & Purchase */}
                                {project.price && project.price > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Price</p>
                                        <p className="text-3xl font-bold text-foreground mb-4">
                                            {project.currency === 'NPR' ? 'Rs ' : '$'}
                                            {project.price.toLocaleString('en-NP')}
                                        </p>
                                        <BuyButton
                                            itemType="project"
                                            itemId={project.id}
                                            itemTitle={project.title}
                                            itemSlug={project.slug}
                                            amount={project.price}
                                            className="w-full"
                                        >
                                            Purchase This Project
                                        </BuyButton>
                                    </div>
                                )}

                                {/* Links */}
                                <div className="space-y-3 pt-6 border-t border-border">
                                    <button
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                detail: { itemType: 'project', itemTitle: project.title }
                                            }))
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-90 rounded-lg transition-opacity w-full"
                                    >
                                        <MessageSquare className="h-5 w-5 text-white" />
                                        <span className="text-white font-medium">Ask About This Project</span>
                                    </button>
                                    {project.demo_url && (
                                        <a
                                            href={project.demo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors group"
                                        >
                                            <ExternalLink className="h-5 w-5 text-primary" />
                                            <span className="text-foreground font-medium">View Live Demo</span>
                                        </a>
                                    )}
                                    {project.github_url && (
                                        <a
                                            href={project.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors group"
                                        >
                                            <Github className="h-5 w-5 text-primary" />
                                            <span className="text-foreground font-medium">View Source Code</span>
                                        </a>
                                    )}
                                </div>

                                {/* Metadata */}
                                <div className="pt-6 border-t border-border space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            Published {new Date(project.created_at).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
