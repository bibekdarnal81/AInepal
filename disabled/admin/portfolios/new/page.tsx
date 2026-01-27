'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import ThumbnailUpload from '@/components/thumbnail-upload'

export default function NewPortfolioPage() {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [clientName, setClientName] = useState('')
    const [category, setCategory] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [projectUrl, setProjectUrl] = useState('')
    const [technologies, setTechnologies] = useState('')
    const [displayOrder, setDisplayOrder] = useState('0')
    const [isFeatured, setIsFeatured] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (!slug || slug === generateSlug(title)) {
            setSlug(generateSlug(newTitle))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const techArray = technologies.split(',').map(t => t.trim()).filter(Boolean)

        const { error: insertError } = await supabase
            .from('portfolios')
            .insert({
                title: title.trim(),
                slug: slug.trim(),
                description: description.trim() || null,
                client_name: clientName.trim() || null,
                category: category.trim() || null,
                image_url: imageUrl.trim() || null,
                project_url: projectUrl.trim() || null,
                technologies: techArray,
                display_order: parseInt(displayOrder) || 0,
                is_featured: isFeatured,
                is_published: isPublished,
            })

        if (insertError) {
            setError(insertError.message)
            setSaving(false)
        } else {
            router.push('/admin/portfolios')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/portfolios" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">New Portfolio</h1>
                    <p className="text-muted-foreground mt-1">Create a new portfolio piece</p>
                </div>
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
                                onChange={handleTitleChange}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Portfolio title"
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
                                placeholder="portfolio-slug"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Brief description of the project"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Client Name</label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Client or company name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="E-commerce, Corporate, etc."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <ThumbnailUpload
                                currentUrl={imageUrl}
                                onUploadComplete={(url) => setImageUrl(url)}
                                label="Portfolio Image"
                                description="Upload portfolio image or provide URL (max 10MB)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Project URL</label>
                            <input
                                type="url"
                                value={projectUrl}
                                onChange={(e) => setProjectUrl(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://example.com"
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
                            <label className="block text-sm font-medium text-foreground mb-2">Technologies (comma-separated)</label>
                            <input
                                type="text"
                                value={technologies}
                                onChange={(e) => setTechnologies(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="React, Next.js, TypeScript, Tailwind CSS"
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
                    <Link href="/admin/portfolios" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
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
                        Create Portfolio
                    </button>
                </div>
            </form>
        </div>
    )
}
