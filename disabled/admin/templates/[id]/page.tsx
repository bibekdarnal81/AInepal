'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import ThumbnailUpload from '@/components/thumbnail-upload'

export default function EditTemplatePage() {
    const params = useParams()
    const id = params.id as string

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [summary, setSummary] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [demoUrl, setDemoUrl] = useState('')
    const [tags, setTags] = useState('')
    const [techStack, setTechStack] = useState('')
    const [price, setPrice] = useState('0')
    const [currency, setCurrency] = useState('NPR')
    const [displayOrder, setDisplayOrder] = useState('0')
    const [isFeatured, setIsFeatured] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchTemplate = async () => {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !data) {
                router.push('/admin/templates')
            } else {
                setTitle(data.title)
                setSlug(data.slug)
                setSummary(data.summary || '')
                setDescription(data.description || '')
                setCategory(data.category || '')
                setImageUrl(data.image_url || '')
                setDemoUrl(data.demo_url || '')
                setTags(data.tags?.join(', ') || '')
                setTechStack(data.tech_stack?.join(', ') || '')
                setPrice((data.price ?? 0).toString())
                setCurrency(data.currency || 'NPR')
                setDisplayOrder(data.display_order?.toString() || '0')
                setIsFeatured(data.is_featured)
                setIsPublished(data.is_published)
            }
            setLoading(false)
        }
        fetchTemplate()
    }, [id, router, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
        const techArray = techStack.split(',').map(t => t.trim()).filter(Boolean)

        const { error: updateError } = await supabase
            .from('templates')
            .update({
                title: title.trim(),
                slug: slug.trim(),
                summary: summary.trim() || null,
                description: description.trim() || null,
                category: category.trim() || null,
                image_url: imageUrl.trim() || null,
                demo_url: demoUrl.trim() || null,
                tags: tagArray,
                tech_stack: techArray,
                price: parseFloat(price) || 0,
                currency: currency.trim() || 'NPR',
                display_order: parseInt(displayOrder) || 0,
                is_featured: isFeatured,
                is_published: isPublished,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (updateError) {
            setError(updateError.message)
            setSaving(false)
        } else {
            router.push('/admin/templates')
        }
    }

    const handleDelete = async () => {
        const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', id)

        if (!error) {
            router.push('/admin/templates')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/templates" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit Template</h1>
                        <p className="text-muted-foreground mt-1">Update template details</p>
                    </div>
                </div>
                <button
                    onClick={() => setDeleteConfirm(true)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Slug *</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Summary</label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Short summary for listing cards"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Detailed description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="SaaS, Portfolio, E-commerce"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Price</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                            <input
                                type="text"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="NPR"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Display Order</label>
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <ThumbnailUpload
                                currentUrl={imageUrl}
                                onUploadComplete={(url) => setImageUrl(url)}
                                label="Template Image"
                                description="Upload a template preview image or provide URL (max 10MB)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Demo URL</label>
                            <input
                                type="url"
                                value={demoUrl}
                                onChange={(e) => setDemoUrl(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://demo.example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Landing, SaaS, Startup"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Tech Stack (comma-separated)</label>
                            <input
                                type="text"
                                value={techStack}
                                onChange={(e) => setTechStack(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Next.js, Supabase, Tailwind"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsFeatured(!isFeatured)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFeatured ? 'bg-primary' : 'bg-secondary'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                            <label className="text-sm font-medium text-foreground">Featured</label>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublished(!isPublished)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? 'bg-primary' : 'bg-secondary'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                            <label className="text-sm font-medium text-foreground">{isPublished ? 'Published' : 'Draft'}</label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Link href="/admin/templates" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Template
                    </button>
                </div>
            </form>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Template</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this template? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
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
