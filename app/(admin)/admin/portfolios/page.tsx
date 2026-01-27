'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, Loader2, X, ChevronLeft, ChevronRight, ExternalLink, Image } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThumbnailUpload from '@/components/thumbnail-upload'

interface Portfolio {
    id: string; title: string; slug: string; description?: string; imageUrl?: string
    projectUrl?: string; category?: string; technologies: string[]
    isFeatured: boolean; isPublished: boolean; displayOrder: number; createdAt: string
}

const initialFormData = { title: '', slug: '', description: '', imageUrl: '', projectUrl: '', category: '', technologies: '', isFeatured: false, isPublished: false, displayOrder: 0 }

export default function AdminPortfoliosPage() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState(initialFormData)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20', status: statusFilter, ...(search && { search }) })
            const res = await fetch(`/api/admin/portfolios?${params}`)
            const data = await res.json()
            if (res.ok) { setPortfolios(data.portfolios); setTotalPages(data.pagination.totalPages); setTotal(data.pagination.total) }
        } catch (error) { console.error('Error:', error) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [page, statusFilter])
    useEffect(() => { const t = setTimeout(() => { if (page === 1) fetchData(); else setPage(1) }, 300); return () => clearTimeout(t) }, [search])

    const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const openCreateModal = () => { setFormData(initialFormData); setIsEditing(false); setEditingId(null); setIsModalOpen(true) }

    const openEditModal = (p: Portfolio) => {
        setFormData({ title: p.title, slug: p.slug, description: p.description || '', imageUrl: p.imageUrl || '', projectUrl: p.projectUrl || '', category: p.category || '', technologies: p.technologies.join(', '), isFeatured: p.isFeatured, isPublished: p.isPublished, displayOrder: p.displayOrder })
        setIsEditing(true); setEditingId(p.id); setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const method = isEditing ? 'PUT' : 'POST'
            const payload = { ...(isEditing && { id: editingId }), ...formData, technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean) }
            const res = await fetch('/api/admin/portfolios', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) { setIsModalOpen(false); fetchData() }
            else { const data = await res.json(); alert(data.error || 'Failed to save') }
        } catch (error) { console.error('Error:', error) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this portfolio item?')) return
        setDeleting(id)
        try { const res = await fetch(`/api/admin/portfolios?id=${id}`, { method: 'DELETE' }); if (res.ok) fetchData() }
        catch (error) { console.error('Error:', error) }
        finally { setDeleting(null) }
    }

    const toggleField = async (id: string, field: 'isPublished' | 'isFeatured', currentValue: boolean) => {
        try { const res = await fetch('/api/admin/portfolios', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: !currentValue }) }); if (res.ok) fetchData() }
        catch (error) { console.error('Error:', error) }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
                    <p className="text-muted-foreground mt-1">Manage your portfolio items ({total} total)</p>
                </div>
                <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> New Portfolio</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search portfolios..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg">
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : portfolios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Image className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No portfolios found</h3>
                        <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-4"><Plus className="h-4 w-4" /> Add Portfolio</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {portfolios.map((p) => (
                            <div key={p.id} className="bg-secondary/20 border border-border rounded-lg overflow-hidden group">
                                <div className="aspect-video relative">
                                    {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary flex items-center justify-center"><Image className="h-8 w-8 text-muted-foreground" /></div>}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><ExternalLink className="h-4 w-4 text-white" /></a>}
                                        <button onClick={() => openEditModal(p)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><Edit2 className="h-4 w-4 text-white" /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70">{deleting === p.id ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Trash2 className="h-4 w-4 text-white" />}</button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium truncate">{p.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => toggleField(p.id, 'isPublished', p.isPublished)} className={`text-xs px-2 py-0.5 rounded-full ${p.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{p.isPublished ? 'Published' : 'Draft'}</button>
                                        <button onClick={() => toggleField(p.id, 'isFeatured', p.isFeatured)} className={`${p.isFeatured ? 'text-yellow-500' : 'text-muted-foreground'}`}><Star className={`h-4 w-4 ${p.isFeatured ? 'fill-current' : ''}`} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold">{isEditing ? 'Edit Portfolio' : 'New Portfolio'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Title *</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value, slug: isEditing ? prev.slug : generateSlug(e.target.value) }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Slug *</label>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" />
                                </div>
                                <div>
                                    <ThumbnailUpload
                                        currentUrl={formData.imageUrl}
                                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                        label="Portfolio Image"
                                        description="Upload a portfolio image (max 10MB)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Project URL</label>
                                    <input type="url" value={formData.projectUrl} onChange={(e) => setFormData(prev => ({ ...prev, projectUrl: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Category</label>
                                        <input type="text" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
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
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))} className="h-4 w-4" /><span className="text-sm">Published</span></label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="h-4 w-4" /><span className="text-sm">Featured</span></label>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}{isEditing ? 'Update' : 'Create'}
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
