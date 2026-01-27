'use client'

import React, { useEffect, useState } from 'react'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    X,
    ChevronLeft,
    ChevronRight,
    Bot
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RichTextEditor } from '@/components/rich-text-editor'
import ThumbnailUpload from '@/components/thumbnail-upload'

interface Post {
    id: string
    title: string
    slug: string
    excerpt?: string
    thumbnailUrl?: string
    category: { id: string; name: string; slug: string } | null
    published: boolean
    createdAt: string
    updatedAt: string
}

interface Category {
    id: string
    name: string
    slug: string
}

interface PostFormData {
    title: string
    slug: string
    content: string
    excerpt: string
    thumbnailUrl: string
    categoryId: string
    published: boolean
}

const initialFormData: PostFormData = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    thumbnailUrl: '',
    categoryId: '',
    published: false
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<PostFormData>(initialFormData)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                status: statusFilter,
                ...(search && { search }),
                ...(categoryFilter && { categoryId: categoryFilter })
            })

            const res = await fetch(`/api/admin/posts?${params}`)
            const data = await res.json()

            if (res.ok) {
                setPosts(data.posts)
                setCategories(data.categories)
                setTotalPages(data.pagination.totalPages)
                setTotal(data.pagination.total)
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [page, statusFilter, categoryFilter])

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (page === 1) fetchPosts()
            else setPage(1)
        }, 300)
        return () => clearTimeout(debounce)
    }, [search])

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value
        setFormData(prev => ({
            ...prev,
            title,
            slug: isEditing ? prev.slug : generateSlug(title)
        }))
    }

    const openCreateModal = () => {
        setFormData(initialFormData)
        setIsEditing(false)
        setEditingId(null)
        setIsModalOpen(true)
    }

    const openEditModal = async (postId: string) => {
        try {
            const res = await fetch(`/api/admin/posts/${postId}`)
            const data = await res.json()

            if (res.ok) {
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    content: data.content || '',
                    excerpt: data.excerpt || '',
                    thumbnailUrl: data.thumbnailUrl || '',
                    categoryId: data.categoryId || '',
                    published: data.published
                })
                setIsEditing(true)
                setEditingId(postId)
                setIsModalOpen(true)
            }
        } catch (error) {
            console.error('Error fetching post:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const url = isEditing ? `/api/admin/posts/${editingId}` : '/api/admin/posts'
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsModalOpen(false)
                fetchPosts()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to save post')
            }
        } catch (error) {
            console.error('Error saving post:', error)
            alert('Failed to save post')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return

        setDeleting(postId)
        try {
            const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' })

            if (res.ok) {
                fetchPosts()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete post')
            }
        } catch (error) {
            console.error('Error deleting post:', error)
        } finally {
            setDeleting(null)
        }
    }

    const togglePublish = async (post: Post) => {
        try {
            const res = await fetch(`/api/admin/posts/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: !post.published })
            })

            if (res.ok) {
                fetchPosts()
            }
        } catch (error) {
            console.error('Error toggling publish:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your blog posts ({total} total)
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Post
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Posts List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No posts found</h3>
                        <p className="text-muted-foreground mb-4">
                            {search || categoryFilter || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first post to get started'}
                        </p>
                        {!search && !categoryFilter && statusFilter === 'all' && (
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                            >
                                <Plus className="h-4 w-4" />
                                Create Post
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/30">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Title</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {post.thumbnailUrl ? (
                                                    <img
                                                        src={post.thumbnailUrl}
                                                        alt={post.title}
                                                        className="h-10 w-14 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-14 bg-secondary rounded flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground">{post.title}</p>
                                                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {post.category ? (
                                                <span className="px-2 py-1 text-xs bg-secondary rounded">
                                                    {post.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => togglePublish(post)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${post.published
                                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                                                    }`}
                                            >
                                                {post.published ? (
                                                    <>
                                                        <Eye className="h-3 w-3" />
                                                        Published
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-3 w-3" />
                                                        Draft
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(post.id)}
                                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    disabled={deleting === post.id}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    {deleting === post.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold">
                                    {isEditing ? 'Edit Post' : 'Create New Post'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-secondary rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        required
                                        className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Enter post title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Slug *</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="post-url-slug"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Excerpt</label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                        rows={2}
                                        className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        placeholder="Brief description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Content</label>
                                    <RichTextEditor
                                        content={formData.content}
                                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                        placeholder="Write your post content..."
                                        minHeight="240px"
                                    />
                                </div>

                                <div>
                                    <ThumbnailUpload
                                        currentUrl={formData.thumbnailUrl}
                                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                                        label="Thumbnail Image"
                                        description="Upload a post thumbnail (max 10MB)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Category</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                        className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="">No category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="published"
                                        checked={formData.published}
                                        onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                                        className="h-4 w-4 rounded border-border"
                                    />
                                    <label htmlFor="published" className="text-sm font-medium">
                                        Publish immediately
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {isEditing ? 'Update Post' : 'Create Post'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
