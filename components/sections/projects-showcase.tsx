'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Github, MessageSquare } from 'lucide-react'
import { BuyButton } from '@/components/buy-button'
import * as Icons from 'lucide-react'

interface Project {
    id: string
    title: string
    slug: string
    description: string | null
    price?: number
    category_id: string | null
    tech_stack: string[]
    demo_url: string | null
    github_url: string | null
    thumbnail_url: string | null
    project_categories?: {
        name: string
        slug: string
        color: string
        icon_name: string | null
    }
}

interface Category {
    id: string
    name: string
    slug: string
    color: string
    icon_name: string | null
}

export function ProjectsSection() {
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        // Fetch categories
        const { data: categoriesData } = await supabase
            .from('project_categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (categoriesData) {
            setCategories(categoriesData)
        }

        // Fetch featured projects with category info
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
            .eq('is_featured', true)
            .order('display_order', { ascending: true })

        if (projectsData) {
            setProjects(projectsData as any)
        }
        setLoading(false)
    }

    const filteredProjects = selectedCategory === 'all'
        ? projects
        : projects.filter(p => p.category_id === selectedCategory)

    if (loading) return null
    if (projects.length === 0) return null

    return (
        <section className="py-20 bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Featured Projects</h2>
                        <p className="text-muted-foreground">Explore our latest work by category</p>
                    </div>
                    <Link
                        href="/projects"
                        className="hidden sm:inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        View All Projects
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedCategory === 'all'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-card border border-border text-foreground hover:bg-secondary'
                            }`}
                    >
                        All Projects
                    </button>
                    {categories.map((category) => {
                        const IconComponent = category.icon_name && (Icons as any)[category.icon_name]
                            ? (Icons as any)[category.icon_name]
                            : Icons.FolderKanban

                        const projectCount = projects.filter(p => p.category_id === category.id).length

                        // Only show categories that have projects
                        if (projectCount === 0) return null

                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedCategory === category.id
                                    ? 'shadow-md'
                                    : 'bg-card border border-border text-foreground hover:bg-secondary'
                                    }`}
                                style={selectedCategory === category.id ? {
                                    backgroundColor: `${category.color}20`,
                                    borderColor: category.color,
                                    color: category.color
                                } : {}}
                            >
                                <IconComponent className="h-4 w-4" style={{ color: category.color }} />
                                {category.name}
                                <span className="text-xs opacity-70">({projectCount})</span>
                            </button>
                        )
                    })}
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No projects found in this category
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project) => {
                            const categoryInfo = project.project_categories as any

                            return (
                                <div
                                    key={project.id}
                                    className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                                >
                                    {project.thumbnail_url && (
                                        <Link href={`/projects/${project.slug}`} className="block">
                                            <div className="aspect-video w-full overflow-hidden bg-secondary cursor-pointer">
                                                <img
                                                    src={project.thumbnail_url}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        </Link>
                                    )}
                                    <div className="p-6">
                                        {categoryInfo && (
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded mb-3 inline-block"
                                                style={{
                                                    backgroundColor: `${categoryInfo.color}20`,
                                                    color: categoryInfo.color
                                                }}
                                            >
                                                {categoryInfo.name}
                                            </span>
                                        )}

                                        <Link href={`/projects/${project.slug}`}>
                                            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer">
                                                {project.title}
                                            </h3>
                                        </Link>

                                        {project.description && (
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}

                                        {project.tech_stack && project.tech_stack.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.tech_stack.slice(0, 3).map((tech: string, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 text-xs bg-secondary text-foreground rounded"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            {project.price && project.price > 0 ? (
                                                <BuyButton
                                                    itemType="project"
                                                    itemId={project.id}
                                                    itemTitle={project.title}
                                                    itemSlug={project.slug}
                                                    amount={project.price}
                                                    className="w-full"
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
                                                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            Demo
                                                        </a>
                                                    )}
                                                    {project.github_url && (
                                                        <a
                                                            href={project.github_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                                                        >
                                                            <Github className="h-4 w-4" />
                                                            Code
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                    detail: { itemType: 'project', itemTitle: project.title }
                                                }))
                                            }}
                                            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors text-sm"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Ask About This Project
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Mobile View All Link */}
                <div className="mt-8 text-center sm:hidden">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        View All Projects
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
