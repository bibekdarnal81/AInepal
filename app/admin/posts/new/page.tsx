'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

export default function NewPostPage() {
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [content, setContent] = useState('')
    const [published, setPublished] = useState(false)
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
                content: content.trim() || null,
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

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={15}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                            placeholder="Write your post content here... (Markdown supported)"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPublished(!published)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                published ? 'bg-primary' : 'bg-secondary'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    published ? 'translate-x-6' : 'translate-x-1'
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
