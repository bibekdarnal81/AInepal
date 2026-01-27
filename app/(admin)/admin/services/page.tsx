'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star, Loader2, X, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThumbnailUpload from '@/components/thumbnail-upload'

interface Service {
    id: string; title: string; slug: string; description?: string; price: number
    currency: string; iconName?: string; thumbnailUrl?: string; features: string[]; category?: string
    isFeatured: boolean; isPublished: boolean; displayOrder: number
}

const initialForm = { title: '', slug: '', description: '', price: 0, currency: 'NPR', iconName: '', thumbnailUrl: '', features: '', category: '', isFeatured: false, isPublished: false, displayOrder: 0 }

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState(initialForm)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20', status: statusFilter, ...(search && { search }) })
            const res = await fetch(`/api/admin/services?${params}`)
            const data = await res.json()
            if (res.ok) { setServices(data.services); setTotalPages(data.pagination.totalPages); setTotal(data.pagination.total) }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [page, statusFilter])
    useEffect(() => { const t = setTimeout(() => { page === 1 ? fetchData() : setPage(1) }, 300); return () => clearTimeout(t) }, [search])

    const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const openCreate = () => { setFormData(initialForm); setIsEditing(false); setEditingId(null); setIsModalOpen(true) }
    const openEdit = (s: Service) => {
        setFormData({ title: s.title, slug: s.slug, description: s.description || '', price: s.price, currency: s.currency, iconName: s.iconName || '', thumbnailUrl: s.thumbnailUrl || '', features: s.features.join('\n'), category: s.category || '', isFeatured: s.isFeatured, isPublished: s.isPublished, displayOrder: s.displayOrder })
        setIsEditing(true); setEditingId(s.id); setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const payload = { ...(isEditing && { id: editingId }), ...formData, features: formData.features.split('\n').map(f => f.trim()).filter(Boolean) }
            const res = await fetch('/api/admin/services', { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) { setIsModalOpen(false); fetchData() } else { const d = await res.json(); alert(d.error) }
        } catch (e) { console.error(e) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; setDeleting(id); try { await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' }); fetchData() } catch (e) { console.error(e) } finally { setDeleting(null) } }

    const toggle = async (id: string, field: string, val: boolean) => { try { await fetch('/api/admin/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: !val }) }); fetchData() } catch (e) { console.error(e) } }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-3xl font-bold">Services</h1><p className="text-muted-foreground mt-1">Manage services ({total})</p></div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> New Service</button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg" /></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg"><option value="all">All</option><option value="published">Published</option><option value="draft">Draft</option></select>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : services.length === 0 ? (
                    <div className="flex flex-col items-center py-20"><Briefcase className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium mb-2">No services</h3><button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-4"><Plus className="h-4 w-4" /> Add</button></div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-secondary/30"><tr><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Service</th><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th><th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
                        <tbody className="divide-y divide-border">
                            {services.map(s => (
                                <tr key={s.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-3"><p className="font-medium">{s.title}</p><p className="text-xs text-muted-foreground">/{s.slug}</p></td>
                                    <td className="px-4 py-3">{s.currency} {s.price.toLocaleString()}</td>
                                    <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => toggle(s.id, 'isPublished', s.isPublished)} className={`px-2 py-1 rounded-full text-xs ${s.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{s.isPublished ? 'Published' : 'Draft'}</button><button onClick={() => toggle(s.id, 'isFeatured', s.isFeatured)} className={s.isFeatured ? 'text-yellow-500' : 'text-muted-foreground'}><Star className={`h-4 w-4 ${s.isFeatured ? 'fill-current' : ''}`} /></button></div></td>
                                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(s)} className="p-2 hover:bg-secondary rounded-lg"><Edit2 className="h-4 w-4 text-muted-foreground" /></button><button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-2 hover:bg-red-500/10 rounded-lg">{deleting === s.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}</button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {totalPages > 1 && <div className="flex items-center justify-between px-4 py-3 border-t border-border"><p className="text-sm text-muted-foreground">Page {page}/{totalPages}</p><div className="flex gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button></div></div>}
            </div>
            <AnimatePresence>{isModalOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border"><h2 className="text-xl font-semibold">{isEditing ? 'Edit' : 'New'} Service</h2><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium mb-1.5">Title *</label><input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value, slug: isEditing ? p.slug : slug(e.target.value) }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" /></div>
                            <div><label className="block text-sm font-medium mb-1.5">Slug *</label><input type="text" value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" /></div>
                            <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" /></div>
                            <div>
                                <ThumbnailUpload
                                    currentUrl={formData.thumbnailUrl}
                                    onUploadComplete={(url) => setFormData(p => ({ ...p, thumbnailUrl: url }))}
                                    label="Thumbnail Image"
                                    description="Upload a service thumbnail (max 10MB)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1.5">Price</label><input type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1.5">Currency</label><select value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"><option value="NPR">NPR</option><option value="USD">USD</option></select></div></div>
                            <div><label className="block text-sm font-medium mb-1.5">Features (one per line)</label><textarea value={formData.features} onChange={e => setFormData(p => ({ ...p, features: e.target.value }))} rows={3} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" /></div>
                            <div className="flex items-center gap-6"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isPublished} onChange={e => setFormData(p => ({ ...p, isPublished: e.target.checked }))} className="h-4 w-4" /><span className="text-sm">Published</span></label><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} className="h-4 w-4" /><span className="text-sm">Featured</span></label></div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{isEditing ? 'Update' : 'Create'}</button></div>
                        </form>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>
        </div>
    )
}
