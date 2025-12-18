'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ExternalLink, Github, ArrowLeft, Search } from 'lucide-react'
import { BuyButton } from '@/components/buy-button'
import * as Icons from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
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
            .order('display_order', { ascending: true })

        if (projectsData) {
            setProjects(projectsData as any)
        }
        setLoading(false)
    }

    const filteredProjects = projects.filter(project => {
        const matchesCategory = selectedCategory === 'all' || project.category_id === selectedCategory
        const matchesSearch = !searchQuery ||
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tech_stack?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>

                        <h1 className="text-4xl font-bold text-foreground mb-4">All Projects</h1>
                        <p className="text-lg text-muted-foreground">
                            Explore our complete portfolio of projects across different categories
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search projects by name, description, or technology..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${selectedCategory === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-card border border-border text-foreground hover:bg-secondary'
                                }`}
                        >
                            All Projects ({projects.length})
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
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${selectedCategory === category.id
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

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground text-lg">
                                {searchQuery ? 'No projects found matching your search' : 'No projects found in this category'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Results Count */}
                            <p className="text-muted-foreground mb-6">
                                Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                            </p>

                            {/* Projects Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProjects.map((project) => {
                                    const categoryInfo = project.project_categories as any

                                    return (
                                        <div
                                            key={project.id}
                                            className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300"
                                        >
                                            {project.thumbnail_url && (
                                                <div className="aspect-video w-full overflow-hidden bg-secondary">
                                                    <img
                                                        src={project.thumbnail_url}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
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

                                                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                                    {project.title}
                                                </h3>

                                                {project.description && (
                                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                                        {project.description}
                                                    </p>
                                                )}

                                                {project.tech_stack && project.tech_stack.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {project.tech_stack.slice(0, 4).map((tech: string, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 text-xs bg-secondary text-foreground rounded"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                        {project.tech_stack.length > 4 && (
                                                            <span className="px-2 py-1 text-xs text-muted-foreground">
                                                                +{project.tech_stack.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 mt-4">
                                                    {project.price && project.price > 0 ? (
                                                        <BuyButton
                                                            itemType="project"
                                                            itemId={project.id}
                                                            itemTitle={project.title}
                                                            itemSlug={project.slug}
                                                            amount={project.price}
                                                            className="flex-1"
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
                                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                    View Demo
                                                                </a>
                                                            )}
                                                            {project.github_url && (
                                                                <a
                                                                    href={project.github_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                                                                >
                                                                    <Github className="h-4 w-4" />
                                                                    Code
                                                                </a>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
