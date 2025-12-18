'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewCategoryPage() {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon_name: 'FolderKanban',
        color: '#3B82F6',
        display_order: 0
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Auto-generate slug if empty
        const slug = formData.slug || generateSlug(formData.name)

        try {
            const { error } = await supabase
                .from('project_categories')
                .insert([
                    {
                        ...formData,
                        slug
                    }
                ])

            if (error) {
                setError(error.message)
            } else {
                router.push('/admin/categories')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: name === 'display_order' ? parseInt(value) || 0 : value
        })

        // Auto-generate slug when name changes
        if (name === 'name' && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: generateSlug(value)
            }))
        }
    }

    const commonIcons = [
        'FolderKanban', 'Globe', 'Smartphone', 'ShoppingCart', 'Briefcase',
        'FileText', 'LayoutDashboard', 'Server', 'Box', 'Code',
        'Palette', 'MessageSquare', 'BookOpen', 'Zap', 'Heart'
    ]

    const commonColors = [
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Green', value: '#10B981' },
        { name: 'Orange', value: '#F59E0B' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Indigo', value: '#6366F1' },
        { name: 'Teal', value: '#14B8A6' },
        { name: 'Gray', value: '#6B7280' }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/categories"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">New Category</h1>
                    <p className="text-muted-foreground mt-1">Create a new project category</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="e.g., Web Development"
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
                            Slug
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Auto-generated from name"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Brief description of this category"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="icon_name" className="block text-sm font-medium text-foreground mb-2">
                            Icon
                        </label>
                        <select
                            id="icon_name"
                            name="icon_name"
                            value={formData.icon_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {commonIcons.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-foreground mb-2">
                            Color
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <select
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {commonColors.map(color => (
                                        <option key={color.value} value={color.value}>{color.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div
                                className="w-12 h-12 rounded-lg border border-border"
                                style={{ backgroundColor: formData.color }}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="display_order" className="block text-sm font-medium text-foreground mb-2">
                        Display Order
                    </label>
                    <input
                        type="number"
                        id="display_order"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <Link
                        href="/admin/categories"
                        className="px-6 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Create Category
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
