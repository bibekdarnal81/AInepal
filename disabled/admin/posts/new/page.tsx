'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { RichTextEditor } from '@/components/rich-text-editor'
import * as Icons from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    color: string
    icon_name: string | null
}

export default function NewPostPage() {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [categoryId, setCategoryId] = useState<string>('')
    const [featuredImage, setFeaturedImage] = useState('')
    const [published, setPublished] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
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
    }

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (data.url) {
                setFeaturedImage(data.url)
            } else {
                setError('Failed to upload image')
            }
        } catch (err) {
            setError('Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        if (!title.trim()) {
            setError('Title is required')
            setSaving(false)
            return
        }

        if (!slug.trim()) {
            setError('Slug is required')
            setSaving(false)
            return
        }

        const { data, error: insertError } = await supabase
            .from('posts')
            .insert({
                title: title.trim(),
                slug: slug.trim(),
                excerpt: excerpt.trim() || null,
                content: content.trim() || null,
                category_id: categoryId || null,
                featured_image_url: featuredImage || null,
                published,
            })
            .select()
            .single()

        if (insertError) {
            if (insertError.code === '23505') {
                setError('A post with this slug already exists')
            } else {
                setError(insertError.message)
            }
            setSaving(false)
        } else {
            router.push('/admin/posts')
        }
    }

    const selectedCategory = categories.find(c => c.id === categoryId)
    const CategoryIcon = selectedCategory?.icon_name && (Icons as any)[selectedCategory.icon_name]
        ? (Icons as any)[selectedCategory.icon_name]
        : null

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/posts"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">New Post</h1>
                    <p className="text-muted-foreground mt-1">Create a new blog post</p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter post title"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Slug
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="post-url-slug"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            This will be the URL: /blog/{slug || 'post-url-slug'}
                        </p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Category
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">No category</option>
                            {categories.map((category) => {
                                const Icon = category.icon_name && (Icons as any)[category.icon_name]
                                    ? (Icons as any)[category.icon_name]
                                    : null
                                return (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                )
                            })}
                        </select>
                        {selectedCategory && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                                style={{
                                    backgroundColor: `${selectedCategory.color}20`,
                                    color: selectedCategory.color
                                }}
                            >
                                {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                                {selectedCategory.name}
                            </div>
                        )}
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Featured Image
                        </label>
                        {featuredImage ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary mb-2">
                                <img
                                    src={featuredImage}
                                    alt="Featured"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFeaturedImage('')}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                Click to upload featured image
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        )}
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Excerpt (Optional)
                        </label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            placeholder="Brief summary of the post..."
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Content
                        </label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Write your post content here..."
                            minHeight="400px"
                        />
                    </div>

                    {/* Published Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPublished(!published)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${published ? 'bg-primary' : 'bg-secondary'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${published ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <label className="text-sm font-medium text-foreground">
                            {published ? 'Published' : 'Draft'}
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Link
                        href="/admin/posts"
                        className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
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
                        Create Post
                    </button>
                </div>
            </form>
        </div>
    )
}
