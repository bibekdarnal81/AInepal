'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, Loader2, X, ChevronLeft, ChevronRight, ExternalLink, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThumbnailUpload from '@/components/thumbnail-upload'

interface Project {
    id: string
    title: string
    slug: string
    description?: string
    thumbnailUrl?: string
    liveUrl?: string
    repoUrl?: string
    price?: number
    currency: string
    category: { id: string; name: string; slug: string; color?: string } | null
    technologies: string[]
    features: string[]
    isPublished: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: string
}

interface Category { id: string; name: string; slug: string; color?: string }

const initialFormData = {
    title: '', slug: '', description: '', thumbnailUrl: '', liveUrl: '', repoUrl: '',
    price: 0, currency: 'NPR', categoryId: '', technologies: '', features: '',
    isPublished: false, isFeatured: false, displayOrder: 0
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState(initialFormData)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20', status: statusFilter, ...(search && { search }), ...(categoryFilter && { categoryId: categoryFilter }) })
            const res = await fetch(`/api/admin/projects?${params}`)
            const data = await res.json()
            if (res.ok) {
                setProjects(data.projects)
                setCategories(data.categories)
                setTotalPages(data.pagination.totalPages)
                setTotal(data.pagination.total)
            }
        } catch (error) { console.error('Error:', error) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchProjects() }, [page, statusFilter, categoryFilter])
    useEffect(() => { const t = setTimeout(() => { if (page === 1) fetchProjects(); else setPage(1) }, 300); return () => clearTimeout(t) }, [search])

    const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value
        setFormData(prev => ({ ...prev, title, slug: isEditing ? prev.slug : generateSlug(title) }))
    }

    const openCreateModal = () => { setFormData(initialFormData); setIsEditing(false); setEditingId(null); setIsModalOpen(true) }

    const openEditModal = (p: Project) => {
        setFormData({
            title: p.title, slug: p.slug, description: p.description || '', thumbnailUrl: p.thumbnailUrl || '',
            liveUrl: p.liveUrl || '', repoUrl: p.repoUrl || '', price: p.price || 0, currency: p.currency,
            categoryId: p.category?.id || '', technologies: p.technologies.join(', '), features: p.features.join('\n'),
            isPublished: p.isPublished, isFeatured: p.isFeatured, displayOrder: p.displayOrder
        })
        setIsEditing(true); setEditingId(p.id); setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const method = isEditing ? 'PUT' : 'POST'
            const payload = {
                ...(isEditing && { id: editingId }),
                ...formData,
                technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
                features: formData.features.split('\n').map(f => f.trim()).filter(Boolean)
            }
            const res = await fetch('/api/admin/projects', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) { setIsModalOpen(false); fetchProjects() }
            else { const data = await res.json(); alert(data.error || 'Failed to save') }
        } catch (error) { console.error('Error:', error) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this project?')) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' })
            if (res.ok) fetchProjects()
        } catch (error) { console.error('Error:', error) }
        finally { setDeleting(null) }
    }

    const toggleField = async (id: string, field: 'isPublished' | 'isFeatured', currentValue: boolean) => {
        try {
            const res = await fetch('/api/admin/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: !currentValue }) })
            if (res.ok) fetchProjects()
        } catch (error) { console.error('Error:', error) }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage your projects ({total} total)</p>
                </div>
                <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> New Project
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg">
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg">
                    <option value="">All Categories</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Store className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No projects found</h3>
                        <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-4"><Plus className="h-4 w-4" /> Create Project</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/30">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Project</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {projects.map((p) => (
                                    <tr key={p.id} className="hover:bg-secondary/20">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {p.thumbnailUrl ? <img src={p.thumbnailUrl} alt={p.title} className="h-10 w-14 object-cover rounded" /> : <div className="h-10 w-14 bg-secondary rounded flex items-center justify-center"><Store className="h-5 w-5 text-muted-foreground" /></div>}
                                                <div>
                                                    <p className="font-medium">{p.title}</p>
                                                    <p className="text-xs text-muted-foreground">/{p.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.category ? <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: `${p.category.color}20`, color: p.category.color }}>{p.category.name}</span> : <span className="text-muted-foreground">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{p.price ? `${p.currency} ${p.price.toLocaleString()}` : '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleField(p.id, 'isPublished', p.isPublished)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {p.isPublished ? <><Eye className="h-3 w-3" /> Published</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                                                </button>
                                                <button onClick={() => toggleField(p.id, 'isFeatured', p.isFeatured)} className={`p-1 rounded ${p.isFeatured ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`} title="Featured">
                                                    <Star className={`h-4 w-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-secondary rounded-lg"><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>}
                                                <button onClick={() => openEditModal(p)} className="p-2 hover:bg-secondary rounded-lg"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                                                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-2 hover:bg-red-500/10 rounded-lg">
                                                    {deleting === p.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold">{isEditing ? 'Edit Project' : 'New Project'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Title *</label>
                                        <input type="text" value={formData.title} onChange={handleTitleChange} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Slug *</label>
                                        <input type="text" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <ThumbnailUpload
                                            currentUrl={formData.thumbnailUrl}
                                            onUploadComplete={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                                            label="Thumbnail Image"
                                            description="Upload a project thumbnail (max 10MB)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Category</label>
                                        <select value={formData.categoryId} onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg">
                                            <option value="">No category</option>
                                            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Live URL</label>
                                        <input type="url" value={formData.liveUrl} onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Repository URL</label>
                                        <input type="url" value={formData.repoUrl} onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Price</label>
                                        <input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Currency</label>
                                        <select value={formData.currency} onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg">
                                            <option value="NPR">NPR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Display Order</label>
                                        <input type="number" value={formData.displayOrder} onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Technologies (comma-separated)</label>
                                    <input type="text" value={formData.technologies} onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))} placeholder="React, TypeScript, Node.js" className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Features (one per line)</label>
                                    <textarea value={formData.features} onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))} rows={3} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))} className="h-4 w-4" /><span className="text-sm">Published</span></label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="h-4 w-4" /><span className="text-sm">Featured</span></label>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {isEditing ? 'Update' : 'Create'}
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
