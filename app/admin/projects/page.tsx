'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

interface Project {
    id: string
    title: string
    slug: string
    category: string | null
    tech_stack: string[]
    is_published: boolean
    is_featured: boolean
    created_at: string
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('display_order', { ascending: true })

            if (!error && data) {
                setProjects(data)
            }
            setLoading(false)
        }
        fetchProjects()
    }, [supabase])

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (!error) {
            setProjects(projects.filter(p => p.id !== id))
        }
        setDeleteConfirm(null)
    }

    const togglePublish = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('projects')
            .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            setProjects(projects.map(p => 
                p.id === id ? { ...p, is_published: !currentStatus } : p
            ))
        }
    }

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage your projects</p>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    New Project
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        {searchQuery ? 'No projects found' : 'No projects yet. Create your first project!'}
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <div key={project.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">{project.title}</h3>
                                    {project.category && (
                                        <p className="text-sm text-muted-foreground mt-1">{project.category}</p>
                                    )}
                                </div>

                                {project.tech_stack && project.tech_stack.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_stack.slice(0, 3).map((tech, i) => (
                                            <span key={i} className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                                                {tech}
                                            </span>
                                        ))}
                                        {project.tech_stack.length > 3 && (
                                            <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                                                +{project.tech_stack.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => togglePublish(project.id, project.is_published)}
                                        className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                                            project.is_published
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-yellow-500/10 text-yellow-500'
                                        }`}
                                    >
                                        {project.is_published ? 'Published' : 'Draft'}
                                    </button>
                                    {project.is_featured && (
                                        <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Link
                                        href={`/admin/projects/${project.id}`}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeleteConfirm(project.id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Project</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
