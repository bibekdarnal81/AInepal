'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import ThumbnailUpload from '@/components/thumbnail-upload'
import { RichTextEditor } from '@/components/rich-text-editor'
import { AccordionItem } from '@/components/accordion'

export default function NewClassPage() {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [summary, setSummary] = useState('')
    const [description, setDescription] = useState('')
    const [level, setLevel] = useState('')
    const [duration, setDuration] = useState('')
    const [startDate, setStartDate] = useState('')
    const [price, setPrice] = useState('0')
    const [currency, setCurrency] = useState('USD')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [displayOrder, setDisplayOrder] = useState('0')
    const [isFeatured, setIsFeatured] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const generateSlug = (value: string) => {
        return value
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

        const { error: insertError } = await supabase
            .from('classes')
            .insert({
                title: title.trim(),
                slug: slug.trim(),
                summary: summary.trim() || null,
                description: description.trim() || null,
                level: level.trim() || null,
                duration: duration.trim() || null,
                start_date: startDate || null,
                price: parseFloat(price) || 0,
                currency,
                thumbnail_url: thumbnailUrl.trim() || null,
                display_order: parseInt(displayOrder) || 0,
                is_featured: isFeatured,
                is_published: isPublished,
            })

        if (insertError) {
            setError(insertError.message)
            setSaving(false)
        } else {
            router.push('/admin/classes')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/classes" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">New Class</h1>
                    <p className="text-muted-foreground mt-1">Create a new class listing</p>
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
                            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Frontend Foundations"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="frontend-foundations"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Summary</label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Short summary that appears on cards."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <AccordionItem title="Description" defaultOpen={true}>
                                <RichTextEditor
                                    content={description}
                                    onChange={setDescription}
                                    placeholder="Write the class description here..."
                                    minHeight="250px"
                                />
                            </AccordionItem>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Level</label>
                            <input
                                type="text"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Beginner, Intermediate"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Duration</label>
                            <input
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="6 weeks"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="NPR">NPR (Rs)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Thumbnail</label>
                            <ThumbnailUpload
                                currentUrl={thumbnailUrl}
                                onUploadComplete={setThumbnailUrl}
                                label="Class Thumbnail"
                                description="Upload a 16:9 cover image"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Display Order</label>
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">Featured on home</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">Published</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href="/admin/classes"
                        className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Class'}
                    </button>
                </div>
            </form>
        </div>
    )
}
