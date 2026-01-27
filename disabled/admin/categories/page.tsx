'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, FolderKanban } from 'lucide-react'
import * as Icons from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    icon_name: string | null
    color: string
    display_order: number
    created_at: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('project_categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (!error && data) {
            setCategories(data)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('project_categories')
            .delete()
            .eq('id', id)

        if (!error) {
            setCategories(categories.filter(c => c.id !== id))
        }
        setDeleteConfirm(null)
    }

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-foreground">Project Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage categories for organizing projects</p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    New Category
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
                        {searchQuery ? 'No categories found' : 'No categories yet. Create your first category!'}
                    </div>
                ) : (
                    filteredCategories.map((category) => {
                        const IconComponent = category.icon_name && (Icons as any)[category.icon_name]
                            ? (Icons as any)[category.icon_name]
                            : FolderKanban

                        return (
                            <div
                                key={category.id}
                                className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: `${category.color}20` }}
                                    >
                                        <IconComponent
                                            className="h-6 w-6"
                                            style={{ color: category.color }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/categories/${category.id}`}
                                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm(category.id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {category.name}
                                </h3>

                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {category.description || 'No description'}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="px-2 py-1 bg-secondary rounded">
                                        {category.slug}
                                    </span>
                                    <span className="px-2 py-1 bg-secondary rounded">
                                        Order: {category.display_order}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Category</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this category? Projects using this category will have their category removed.
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
