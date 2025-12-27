'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, MessageSquare, Code2, Globe } from 'lucide-react'
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin-reverse"></div>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Header />
                <main className="py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
                        <p className="text-zinc-400 mb-8">The project you're looking for doesn't exist or has been removed.</p>
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors"
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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            <Header />
            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-6xl px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-10 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Projects
                    </Link>

                    {/* Project Header */}
                    <div className="mb-12">
                        {categoryInfo && (
                            <div className="flex items-center gap-3 mb-6">
                                <span
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-xs border"
                                    style={{
                                        backgroundColor: `${categoryInfo.color}15`, // 15% opacity
                                        color: categoryInfo.color,
                                        borderColor: `${categoryInfo.color}30`
                                    }}
                                >
                                    <CategoryIcon className="h-3.5 w-3.5" />
                                    {categoryInfo.name}
                                </span>
                            </div>
                        )}
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            {project.title}
                        </h1>
                        {project.description && (
                            <p className="text-xl md:text-2xl text-zinc-400 max-w-4xl leading-relaxed font-light">
                                {project.description}
                            </p>
                        )}
                    </div>

                    {/* Project Image */}
                    {project.thumbnail_url && (
                        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl shadow-blue-900/10 mb-16 relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img
                                src={project.thumbnail_url}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Project Content */}
                            {project.content && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <div className="w-1 h-8 bg-blue-500 rounded-full" />
                                        About This Project
                                    </h2>
                                    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-400 prose-strong:text-white prose-ul:text-zinc-400 prose-li:marker:text-blue-500">
                                        <div
                                            dangerouslySetInnerHTML={{ __html: project.content }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Features */}
                            {project.features && project.features.length > 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <div className="w-1 h-8 bg-purple-500 rounded-full" />
                                        Key Features
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {project.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                    <svg
                                                        className="h-3 w-3 text-green-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={3}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-zinc-300 text-sm leading-relaxed font-medium">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tech Stack */}
                            {project.tech_stack && project.tech_stack.length > 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <div className="w-1 h-8 bg-orange-500 rounded-full" />
                                        Technologies Used
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_stack.map((tech, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg group hover:border-blue-500/50 transition-colors"
                                            >
                                                <Code2 className="h-4 w-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                                                <span className="text-zinc-300 font-mono text-sm group-hover:text-white transition-colors">{tech}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 space-y-6">
                                {/* Actions Card */}
                                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                                    {/* Price & Purchase */}
                                    {project.price && project.price > 0 && (
                                        <div className="mb-8">
                                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">License Price</p>
                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className="text-4xl font-bold text-white">
                                                    {project.currency === 'NPR' ? 'Rs ' : '$'}
                                                    {project.price.toLocaleString('en-US')}
                                                </span>
                                            </div>
                                            <BuyButton
                                                itemType="project"
                                                itemId={project.id}
                                                itemTitle={project.title}
                                                itemSlug={project.slug}
                                                amount={project.price}
                                                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                                            >
                                                Purchase License
                                            </BuyButton>
                                        </div>
                                    )}

                                    {/* Links */}
                                    <div className="space-y-3">
                                        {project.demo_url && (
                                            <a
                                                href={project.demo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between px-4 py-3 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all group"
                                            >
                                                <span className="font-medium flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    View Live Demo
                                                </span>
                                                <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                        {project.github_url && (
                                            <a
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between px-4 py-3 bg-zinc-800 border border-white/5 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all group"
                                            >
                                                <span className="font-medium flex items-center gap-2">
                                                    <Github className="h-4 w-4" />
                                                    Source Code
                                                </span>
                                                <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}

                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                    detail: { itemType: 'project', itemTitle: project.title }
                                                }))
                                            }}
                                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors border-t border-white/5 pt-4"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            <span>Ask a Question</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Metadata Card */}
                                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-sm font-bold text-white mb-4">Project Details</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-500">Published</span>
                                            <span className="text-zinc-300 font-medium">
                                                {new Date(project.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {project.tags && project.tags.length > 0 && (
                                            <div className="pt-4 border-t border-white/5">
                                                <span className="text-xs font-medium text-zinc-500 block mb-3 uppercase tracking-wider">Tags</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-md text-xs border border-white/5"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
