'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Loader2, Layers, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
    id: string; name: string; slug: string; description: string
    color: string; iconName: string; displayOrder: number; createdAt: string
}

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [formData, setFormData] = useState({ name: '', slug: '', description: '', color: '#3b82f6', iconName: '', displayOrder: 0 })

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/categories')
            const data = await res.json()
            if (res.ok) setCategories(data.categories)
        } catch (error) { console.error('Error:', error) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const openCreateModal = () => { setFormData({ name: '', slug: '', description: '', color: '#3b82f6', iconName: '', displayOrder: 0 }); setIsEditing(false); setEditingId(null); setIsModalOpen(true) }

    const openEditModal = (c: Category) => {
        setFormData({ name: c.name, slug: c.slug, description: c.description, color: c.color, iconName: c.iconName, displayOrder: c.displayOrder })
        setIsEditing(true); setEditingId(c.id); setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const method = isEditing ? 'PUT' : 'POST'
            const payload = { ...(isEditing && { id: editingId }), ...formData }
            const res = await fetch('/api/admin/categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) { setIsModalOpen(false); fetchData() }
            else { const data = await res.json(); alert(data.error || 'Failed to save') }
        } catch (error) { console.error('Error:', error) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return
        setDeleting(id)
        try { const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' }); if (res.ok) fetchData() }
        catch (error) { console.error('Error:', error) }
        finally { setDeleting(null) }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage project categories</p>
                </div>
                <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> New Category</button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No categories</h3>
                        <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-4"><Plus className="h-4 w-4" /> Create Category</button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Color</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Slug</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Order</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {categories.map((c) => (
                                <tr key={c.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-3"><div className="w-6 h-6 rounded-full" style={{ backgroundColor: c.color }} /></td>
                                    <td className="px-4 py-3 font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">/{c.slug}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.displayOrder}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(c)} className="p-2 hover:bg-secondary rounded-lg"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                                            <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-2 hover:bg-red-500/10 rounded-lg">
                                                {deleting === c.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold">{isEditing ? 'Edit Category' : 'New Category'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Name *</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value, slug: isEditing ? prev.slug : generateSlug(e.target.value) }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Slug *</label>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Color</label>
                                    <div className="flex items-center gap-2">
                                        {colors.map((c) => (
                                            <button key={c} type="button" onClick={() => setFormData(prev => ({ ...prev, color: c }))} className={`w-8 h-8 rounded-full border-2 ${formData.color === c ? 'border-foreground' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Display Order</label>
                                    <input type="number" value={formData.displayOrder} onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50">
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
