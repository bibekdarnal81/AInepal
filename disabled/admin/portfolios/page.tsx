'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Eye, Image as ImageIcon } from 'lucide-react'

interface Portfolio {
    id: string
    title: string
    slug: string
    description: string | null
    image_url: string | null
    client_name: string | null
    category: string | null
    technologies: string[]
    project_url: string | null
    is_published: boolean
    is_featured: boolean
    display_order: number
    created_at: string
}

export default function PortfoliosPage() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchPortfolios = async () => {
            const { data, error } = await supabase
                .from('portfolios')
                .select('*')
                .order('display_order', { ascending: true })

            if (!error && data) {
                setPortfolios(data)
            }
            setLoading(false)
        }
        fetchPortfolios()
    }, [supabase])

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('portfolios')
            .delete()
            .eq('id', id)

        if (!error) {
            setPortfolios(portfolios.filter(p => p.id !== id))
        }
        setDeleteConfirm(null)
    }

    const togglePublish = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('portfolios')
            .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            setPortfolios(portfolios.map(p =>
                p.id === id ? { ...p, is_published: !currentStatus } : p
            ))
        }
    }

    const filteredPortfolios = portfolios.filter(portfolio =>
        portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (portfolio.client_name && portfolio.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        portfolio.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-foreground">Beautiful Portfolios</h1>
                    <p className="text-muted-foreground mt-1">Manage your portfolio showcase</p>
                </div>
                <Link
                    href="/admin/portfolios/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    New Portfolio
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search portfolios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolios.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        {searchQuery ? 'No portfolios found' : 'No portfolios yet. Create your first portfolio!'}
                    </div>
                ) : (
                    filteredPortfolios.map((portfolio) => (
                        <div key={portfolio.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
                            {portfolio.image_url ? (
                                <div className="aspect-video w-full bg-secondary relative overflow-hidden">
                                    <img
                                        src={portfolio.image_url}
                                        alt={portfolio.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video w-full bg-secondary flex items-center justify-center">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">{portfolio.title}</h3>
                                    {portfolio.client_name && (
                                        <p className="text-sm text-muted-foreground mt-1">Client: {portfolio.client_name}</p>
                                    )}
                                    {portfolio.category && (
                                        <p className="text-sm text-primary mt-1">{portfolio.category}</p>
                                    )}
                                </div>

                                {portfolio.technologies && portfolio.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {portfolio.technologies.slice(0, 3).map((tech, i) => (
                                            <span key={i} className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                                                {tech}
                                            </span>
                                        ))}
                                        {portfolio.technologies.length > 3 && (
                                            <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                                                +{portfolio.technologies.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => togglePublish(portfolio.id, portfolio.is_published)}
                                        className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${portfolio.is_published
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-yellow-500/10 text-yellow-500'
                                            }`}
                                    >
                                        {portfolio.is_published ? 'Published' : 'Draft'}
                                    </button>
                                    {portfolio.is_featured && (
                                        <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    {portfolio.project_url && (
                                        <a
                                            href={portfolio.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </a>
                                    )}
                                    <Link
                                        href={`/admin/portfolios/${portfolio.id}`}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeleteConfirm(portfolio.id)}
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
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Portfolio</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this portfolio? This action cannot be undone.
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
