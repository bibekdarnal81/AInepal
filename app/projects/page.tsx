import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Tag, ArrowRight, Sparkles, FolderKanban } from 'lucide-react'
import dbConnect from '@/lib/mongodb/client'
import { Project, ProjectCategory } from '@/lib/mongodb/models'

interface ProjectData {
    _id: string
    title: string
    slug: string
    description: string | null
    thumbnailUrl: string | null
    category: string | null
    technologies: string[]
    isFeatured: boolean
    createdAt: Date
}

interface CategoryData {
    _id: string
    name: string
    slug: string
}

async function getProjectsAndCategories() {
    await dbConnect()

    const [projects, categories] = await Promise.all([
        Project.find({})
            .select('title slug description thumbnailUrl categoryId technologies isFeatured createdAt displayOrder')
            .populate({
                path: 'categoryId',
                model: ProjectCategory,
                select: 'name slug'
            })
            .sort({ displayOrder: 1, createdAt: -1 })
            .lean(),
        ProjectCategory.find()
            .sort({ displayOrder: 1 })
            .lean()
    ])

    const typedProjects = projects as unknown as Array<{
        _id: string
        title: string
        slug: string
        description?: string
        thumbnailUrl?: string
        categoryId?: { name?: string } | null
        technologies?: string[]
        isFeatured?: boolean
        createdAt: Date
    }>
    const typedCategories = categories as unknown as Array<{
        _id: string
        name: string
        slug: string
    }>

    return {
        projects: typedProjects.map((p) => ({
            _id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            description: p.description || null,
            thumbnailUrl: p.thumbnailUrl || null,
            category: p.categoryId?.name || null,
            technologies: p.technologies || [],
            isFeatured: p.isFeatured || false,
            createdAt: p.createdAt,
        })),
        categories: typedCategories.map((c) => ({
            _id: c._id.toString(),
            name: c.name,
            slug: c.slug,
        }))
    }
}

export default async function ProjectsPage() {
    const { projects, categories } = await getProjectsAndCategories()

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-24 pb-20">
                {/* Hero */}
                <section className="px-6 lg:px-8 mb-16">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                            <FolderKanban className="h-4 w-4" />
                            <span>Our Projects</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Projects</span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Explore our portfolio of digital solutions that have helped businesses transform and grow.
                        </p>
                    </div>
                </section>

                {/* Projects Grid */}
                <section className="px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {projects.length === 0 ? (
                            <div className="text-center py-20 bg-card rounded-2xl border border-border">
                                <p className="text-muted-foreground text-lg">No projects available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <div
                                        key={project._id}
                                        className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:border-blue-500/30 transition-all"
                                    >
                                        {project.thumbnailUrl ? (
                                            <div className="relative aspect-video bg-secondary overflow-hidden">
                                                <Image
                                                    src={project.thumbnailUrl}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                                                <FolderKanban className="h-12 w-12 text-blue-400/50" />
                                            </div>
                                        )}

                                        <div className="flex-1 p-6">
                                            {project.category && (
                                                <div className="flex items-center gap-1.5 text-xs text-blue-400 mb-2">
                                                    <Tag className="h-3 w-3" />
                                                    <span>{project.category}</span>
                                                </div>
                                            )}

                                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors">
                                                {project.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                                {project.description}
                                            </p>

                                            {project.technologies && project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {project.technologies.slice(0, 3).map((tech: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 text-xs bg-secondary rounded-md text-muted-foreground"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 3 && (
                                                        <span className="px-2 py-1 text-xs text-muted-foreground">
                                                            +{project.technologies.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 pt-0">
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                                            >
                                                View Project
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
