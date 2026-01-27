'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Loader2, FolderOpen, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
    id: string
    name: string
    slug: string
    description: string
    createdAt: string
}

export default function AdminPostCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    const [formData, setFormData] = useState({ name: '', slug: '', description: '' })

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/post-categories')
            const data = await res.json()
            if (res.ok) setCategories(data.categories)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCategories() }, [])

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setFormData(prev => ({ ...prev, name, slug: isEditing ? prev.slug : generateSlug(name) }))
    }

    const openCreateModal = () => {
        setFormData({ name: '', slug: '', description: '' })
        setIsEditing(false)
        setEditingId(null)
        setIsModalOpen(true)
    }

    const openEditModal = (cat: Category) => {
        setFormData({ name: cat.name, slug: cat.slug, description: cat.description })
        setIsEditing(true)
        setEditingId(cat.id)
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const method = isEditing ? 'PUT' : 'POST'
            const body = isEditing ? { id: editingId, ...formData } : formData

            const res = await fetch('/api/admin/post-categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                setIsModalOpen(false)
                fetchCategories()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to save')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/post-categories?id=${id}`, { method: 'DELETE' })
            if (res.ok) fetchCategories()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Post Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage blog post categories</p>
                </div>
                <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> New Category
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No categories</h3>
                        <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-4">
                            <Plus className="h-4 w-4" /> Create Category
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Slug</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Description</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">/{cat.slug}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-sm">{cat.description || '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(cat)} className="p-2 hover:bg-secondary rounded-lg">
                                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} className="p-2 hover:bg-red-500/10 rounded-lg">
                                                {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}
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
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold">{isEditing ? 'Edit Category' : 'New Category'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Name *</label>
                                    <input type="text" value={formData.name} onChange={handleNameChange} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Slug *</label>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
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
