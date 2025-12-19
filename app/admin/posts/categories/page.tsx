'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import * as Icons from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    color: string
    icon_name: string | null
}

interface EditingCategory {
    id?: string
    name: string
    slug: string
    description: string
    color: string
    icon_name: string
}

export default function PostCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [error, setError] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('post_categories')
            .select('*')
            .order('name')

        if (data) {
            setCategories(data)
        }
        setLoading(false)
    }

    const iconNames = ['Code', 'Palette', 'Briefcase', 'BookOpen', 'Newspaper', 'Lightbulb', 'Rocket', 'Heart', 'Star', 'Zap']

    const handleSave = async () => {
        if (!editingCategory) return

        setError('')

        const categoryData = {
            name: editingCategory.name.trim(),
            slug: editingCategory.slug.trim(),
            description: editingCategory.description.trim() || null,
            color: editingCategory.color,
            icon_name: editingCategory.icon_name,
        }

        if (editingCategory.id) {
            // Update existing
            const { error } = await supabase
                .from('post_categories')
                .update(categoryData)
                .eq('id', editingCategory.id)

            if (error) {
                setError(error.message)
                return
            }
        } else {
            // Create new
            const { error } = await supabase
                .from('post_categories')
                .insert(categoryData)

            if (error) {
                setError(error.message)
                return
            }
        }

        setEditingCategory(null)
        fetchCategories()
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('post_categories')
            .delete()
            .eq('id', id)

        if (error) {
            setError(error.message)
        } else {
            setDeleteConfirm(null)
            fetchCategories()
        }
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Post Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage categories for your blog posts</p>
                </div>
                <button
                    onClick={() => setEditingCategory({ name: '', slug: '', description: '', color: '#6366f1', icon_name: 'Code' })}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                    const Icon = category.icon_name && (Icons as any)[category.icon_name]
                        ? (Icons as any)[category.icon_name]
                        : Icons.Tag

                    return (
                        <div key={category.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                                    style={{
                                        backgroundColor: `${category.color}20`,
                                        color: category.color
                                    }}
                                >
                                    <Icon className="h-4 w-4" />
                                    {category.name}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setEditingCategory({
                                            id: category.id,
                                            name: category.name,
                                            slug: category.slug,
                                            description: category.description || '',
                                            color: category.color,
                                            icon_name: category.icon_name || 'Code'
                                        })}
                                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(category.id)}
                                        className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-mono">/{category.slug}</p>
                                {category.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No categories yet. Create one to get started!</p>
                </div>
            )}

            {/* Edit/Create Modal */}
            {editingCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-lg w-full space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">
                                {editingCategory.id ? 'Edit Category' : 'New Category'}
                            </h3>
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                                <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => {
                                        const newName = e.target.value
                                        setEditingCategory({
                                            ...editingCategory,
                                            name: newName,
                                            slug: !editingCategory.id || editingCategory.slug === generateSlug(editingCategory.name)
                                                ? generateSlug(newName)
                                                : editingCategory.slug
                                        })
                                    }}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Category name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={editingCategory.slug}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                    placeholder="category-slug"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                <textarea
                                    value={editingCategory.description}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={editingCategory.color}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                                        className="h-10 w-20 rounded border border-border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={editingCategory.color}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Icon</label>
                                <select
                                    value={editingCategory.icon_name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, icon_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {iconNames.map(iconName => {
                                        const Icon = (Icons as any)[iconName]
                                        return (
                                            <option key={iconName} value={iconName}>
                                                {iconName}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                                style={{
                                    backgroundColor: `${editingCategory.color}20`,
                                    color: editingCategory.color
                                }}
                            >
                                {(() => {
                                    const Icon = (Icons as any)[editingCategory.icon_name]
                                    return <Icon className="h-4 w-4" />
                                })()}
                                {editingCategory.name || 'Preview'}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                onClick={() => setEditingCategory(null)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Category</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this category? Posts using this category will have it removed.
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
