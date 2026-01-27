'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, X, ChevronLeft, ChevronRight, BadgeCheck, Upload, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThumbnailUpload from '@/components/thumbnail-upload'

interface Membership {
    id: string
    name: string
    slug: string
    description?: string
    price: number
    priceMonthly?: number
    priceYearly?: number
    yearlyDiscountPercent?: number
    discount?: number
    advancedCredits?: number
    appIntegrationIcons?: string[]
    platformIcons?: string[]
    badgeText?: string
    currency: string
    durationDays: number
    features: string[]
    iconName?: string
    imageUrl?: string
    additionalSections?: MembershipSection[]
    featureCategories?: { categoryName: string; items: { icon?: string; name: string }[] }[]
    isActive: boolean
    sortOrder: number
}

interface MembershipSection {
    title?: string
    text?: string
    imageUrl?: string
    videoUrl?: string
    quote?: string
    heading?: string
    embedHtml?: string
}


const initialForm = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    priceMonthly: '',
    priceYearly: '',
    yearlyDiscountPercent: '',
    discount: '',
    currency: 'USD',
    durationDays: 30,
    features: '',
    featureCategories: [] as { categoryName: string; items: { icon?: string; name: string }[] }[],
    advancedCredits: '',
    appIntegrationIcons: [] as string[],
    platformIcons: [] as string[],
    badgeText: '',
    iconName: '',
    imageUrl: '',
    additionalSections: [] as MembershipSection[],
    isActive: true,
    sortOrder: 0,
}

type MembershipForm = typeof initialForm

export default function AdminMembershipsPage() {
    const [memberships, setMemberships] = useState<Membership[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<MembershipForm>(initialForm)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const emptySection: MembershipSection = { title: '', text: '', imageUrl: '', videoUrl: '', quote: '', heading: '', embedHtml: '' }

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                status: statusFilter,
                ...(search && { search }),
            })
            const res = await fetch(`/api/admin/memberships?${params}`)
            const data = await res.json()
            if (res.ok) {
                setMemberships(data.memberships)
                setTotalPages(data.pagination.totalPages)
                setTotal(data.pagination.total)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [page, statusFilter])
    useEffect(() => {
        const t = setTimeout(() => { page === 1 ? fetchData() : setPage(1) }, 300)
        return () => clearTimeout(t)
    }, [search])

    const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const [uploadingItem, setUploadingItem] = useState<{ catIdx: number, itemIdx: number } | null>(null)
    const [uploadingIntegration, setUploadingIntegration] = useState<number | null>(null)
    const [uploadingPlatform, setUploadingPlatform] = useState<number | null>(null)

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        return data.url
    }

    const handleItemIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, catIdx: number, itemIdx: number) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingItem({ catIdx, itemIdx })
        try {
            const url = await uploadFile(file)
            const newCats = [...formData.featureCategories]
            newCats[catIdx].items[itemIdx].icon = url
            setFormData(p => ({ ...p, featureCategories: newCats }))
        } catch (error) {
            console.error(error)
            alert('Upload failed')
        } finally {
            setUploadingItem(null)
        }
    }

    // Handlers for App Integrations
    const addAppIntegration = () => setFormData(p => ({ ...p, appIntegrationIcons: [...(p.appIntegrationIcons || []), ''] }))
    const removeAppIntegration = (idx: number) => setFormData(p => ({ ...p, appIntegrationIcons: (p.appIntegrationIcons || []).filter((_, i) => i !== idx) }))
    const updateAppIntegration = (idx: number, val: string) => {
        const newIcons = [...(formData.appIntegrationIcons || [])]
        newIcons[idx] = val
        setFormData(p => ({ ...p, appIntegrationIcons: newIcons }))
    }
    const handleAppIntegrationUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingIntegration(idx)
        try {
            const url = await uploadFile(file)
            updateAppIntegration(idx, url)
        } catch (e) {
            console.error(e)
            alert('Upload failed')
        } finally {
            setUploadingIntegration(null)
        }
    }

    // Handlers for Platform Icons
    const addPlatformIcon = () => setFormData(p => ({ ...p, platformIcons: [...(p.platformIcons || []), ''] }))
    const removePlatformIcon = (idx: number) => setFormData(p => ({ ...p, platformIcons: (p.platformIcons || []).filter((_, i) => i !== idx) }))
    const updatePlatformIcon = (idx: number, val: string) => {
        const newIcons = [...(formData.platformIcons || [])]
        newIcons[idx] = val
        setFormData(p => ({ ...p, platformIcons: newIcons }))
    }
    const handlePlatformIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingPlatform(idx)
        try {
            const url = await uploadFile(file)
            updatePlatformIcon(idx, url)
        } catch (e) {
            console.error(e)
            alert('Upload failed')
        } finally {
            setUploadingPlatform(null)
        }
    }

    const openCreate = () => {
        setFormData(initialForm)
        setIsEditing(false)
        setEditingId(null)
        setIsModalOpen(true)
    }

    const openEdit = (m: Membership) => {
        setFormData({
            name: m.name,
            slug: m.slug,
            description: m.description || '',
            price: m.price,
            priceMonthly: m.priceMonthly !== undefined ? String(m.priceMonthly) : '',
            priceYearly: m.priceYearly !== undefined ? String(m.priceYearly) : '',
            yearlyDiscountPercent: m.yearlyDiscountPercent !== undefined ? String(m.yearlyDiscountPercent) : '',
            discount: m.discount !== undefined ? String(m.discount) : '',
            currency: m.currency,
            durationDays: m.durationDays,
            features: m.features.join('\n'),
            advancedCredits: m.advancedCredits ? String(m.advancedCredits) : '',
            appIntegrationIcons: m.appIntegrationIcons || [],
            platformIcons: m.platformIcons || [],
            badgeText: m.badgeText || '',
            iconName: m.iconName || '',
            imageUrl: m.imageUrl || '',
            featureCategories: m.featureCategories || [],
            additionalSections: m.additionalSections || [],
            isActive: m.isActive,
            sortOrder: m.sortOrder,
        })
        setIsEditing(true)
        setEditingId(m.id)
        setIsModalOpen(true)
    }

    const handleClone = (m: Membership) => {
        const clonedName = `${m.name} (Copy)`
        const clonedSlug = `${m.slug}-copy-${Date.now()}`
        setFormData({
            name: clonedName,
            slug: clonedSlug,
            description: m.description || '',
            price: m.price,
            priceMonthly: m.priceMonthly !== undefined ? String(m.priceMonthly) : '',
            priceYearly: m.priceYearly !== undefined ? String(m.priceYearly) : '',
            yearlyDiscountPercent: m.yearlyDiscountPercent !== undefined ? String(m.yearlyDiscountPercent) : '',
            discount: m.discount !== undefined ? String(m.discount) : '',
            currency: m.currency,
            durationDays: m.durationDays,
            features: m.features.join('\n'),
            advancedCredits: m.advancedCredits ? String(m.advancedCredits) : '',
            appIntegrationIcons: m.appIntegrationIcons || [],
            platformIcons: m.platformIcons || [],
            badgeText: m.badgeText || '',
            iconName: m.iconName || '',
            imageUrl: m.imageUrl || '',
            featureCategories: m.featureCategories || [],
            additionalSections: m.additionalSections || [],
            isActive: false, // Set cloned membership as inactive by default
            sortOrder: m.sortOrder + 1,
        })
        setIsEditing(false) // This ensures it creates a new record
        setEditingId(null)
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                ...(isEditing && { id: editingId }),
                ...formData,
                features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
                discount: formData.discount ? parseInt(formData.discount as string, 10) : undefined,
                advancedCredits: formData.advancedCredits ? parseInt(formData.advancedCredits as string, 10) : undefined,
                appIntegrationIcons: formData.appIntegrationIcons || [],
                platformIcons: formData.platformIcons || [],
                featureCategories: formData.featureCategories,
            }
            const res = await fetch('/api/admin/memberships', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (res.ok) {
                setIsModalOpen(false)
                fetchData()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to save membership')
            }
        } catch (e) {
            console.error(e)
            alert('An error occurred')
        } finally {
            setSaving(false)
        }
    }

    const addSection = () => {
        setFormData(p => ({ ...p, additionalSections: [...p.additionalSections, { ...emptySection }] }))
    }

    const updateSection = (index: number, key: keyof MembershipSection, value: string) => {
        setFormData(p => ({
            ...p,
            additionalSections: p.additionalSections.map((section, i) => i === index ? { ...section, [key]: value } : section),
        }))
    }

    const removeSection = (index: number) => {
        setFormData(p => ({
            ...p,
            additionalSections: p.additionalSections.filter((_, i) => i !== index),
        }))
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return
        setDeleting(id)
        try {
            await fetch(`/api/admin/memberships?id=${id}`, { method: 'DELETE' })
            fetchData()
        } catch (e) {
            console.error(e)
        } finally {
            setDeleting(null)
        }
    }

    const toggleActive = async (id: string, current: boolean) => {
        try {
            await fetch('/api/admin/memberships', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !current }),
            })
            fetchData()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Memberships</h1>
                    <p className="text-muted-foreground mt-1">Manage memberships ({total})</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> New Membership
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg">
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : memberships.length === 0 ? (
                    <div className="flex flex-col items-center py-20">
                        <BadgeCheck className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No memberships</h3>
                        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg mt-4">
                            <Plus className="h-4 w-4" /> Add Membership
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Plan</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Credits</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Duration</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {memberships.map(m => (
                                <tr key={m.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {m.imageUrl ? (
                                                <img src={m.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                                    {m.name?.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{m.name}</p>
                                                <p className="text-xs text-muted-foreground">/{m.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{m.currency} {m.price.toLocaleString()}</td>
                                    <td className="px-4 py-3">{m.advancedCredits ? m.advancedCredits.toLocaleString() : '-'}</td>
                                    <td className="px-4 py-3">{m.durationDays} days</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggleActive(m.id, m.isActive)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.isActive ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {m.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                            {m.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleClone(m)} className="p-2 hover:bg-secondary rounded-lg" title="Clone">
                                                <Copy className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button onClick={() => openEdit(m)} className="p-2 hover:bg-secondary rounded-lg" title="Edit">
                                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id} className="p-2 hover:bg-red-500/10 rounded-lg" title="Delete">
                                                {deleting === m.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">Page {page}/{totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold">{isEditing ? 'Edit' : 'New'} Membership</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Name *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value, slug: isEditing ? p.slug : slug(e.target.value) }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Slug *</label>
                                    <input type="text" value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} required className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Icon Name</label>
                                    <input
                                        type="text"
                                        value={formData.iconName}
                                        onChange={e => setFormData(p => ({ ...p, iconName: e.target.value }))}
                                        className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                                        placeholder="Lucide icon name (e.g. Crown, Star)"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Use a Lucide icon name to show an icon on the membership card.</p>
                                </div>
                                <div>
                                    <ThumbnailUpload
                                        currentUrl={formData.imageUrl}
                                        onUploadComplete={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
                                        label="Membership Image"
                                        description="Upload a membership image (max 10MB)"
                                        inputId="membership-image-upload"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Price</label>
                                        <input type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Currency</label>
                                        <select value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg">
                                            <option value="USD">USD</option>
                                            <option value="NPR">NPR</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Monthly Price</label>
                                        <input
                                            type="number"
                                            value={formData.priceMonthly}
                                            onChange={e => setFormData(p => ({ ...p, priceMonthly: e.target.value }))}
                                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Yearly Price</label>
                                        <input
                                            type="number"
                                            value={formData.priceYearly}
                                            onChange={e => setFormData(p => ({ ...p, priceYearly: e.target.value }))}
                                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Yearly Discount %</label>
                                        <input
                                            type="number"
                                            value={formData.yearlyDiscountPercent}
                                            onChange={e => setFormData(p => ({ ...p, yearlyDiscountPercent: e.target.value }))}
                                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Duration (days)</label>
                                        <input type="number" value={formData.durationDays} onChange={e => setFormData(p => ({ ...p, durationDays: parseInt(e.target.value, 10) || 0 }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Credit Points</label>
                                        <input
                                            type="number"
                                            value={formData.advancedCredits}
                                            onChange={e => setFormData(p => ({ ...p, advancedCredits: e.target.value }))}
                                            placeholder="e.g., 4500"
                                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Sort Order</label>
                                        <input type="number" value={formData.sortOrder} onChange={e => setFormData(p => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Simple Features (one per line)</label>
                                    <textarea value={formData.features} onChange={e => setFormData(p => ({ ...p, features: e.target.value }))} rows={3} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none" />
                                </div>

                                <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-primary">Feature Categories (Rich Text)</p>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, featureCategories: [...p.featureCategories, { categoryName: '', items: [] }] }))}
                                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
                                        >
                                            Add Category
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.featureCategories.map((cat, catIdx) => (
                                            <div key={catIdx} className="border border-border rounded-lg p-3 bg-card">
                                                <div className="flex justify-between mb-2">
                                                    <input
                                                        placeholder="Category Name"
                                                        value={cat.categoryName}
                                                        onChange={e => {
                                                            const newCats = [...formData.featureCategories]
                                                            newCats[catIdx].categoryName = e.target.value
                                                            setFormData(p => ({ ...p, featureCategories: newCats }))
                                                        }}
                                                        className="px-2 py-1 bg-secondary border border-border rounded text-sm w-full mr-2"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newCats = formData.featureCategories.filter((_, i) => i !== catIdx)
                                                            setFormData(p => ({ ...p, featureCategories: newCats }))
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="pl-4 space-y-2 border-l-2 border-border">
                                                    {cat.items.map((item, itemIdx) => (
                                                        <div key={itemIdx} className="flex gap-2 items-center">
                                                            <div className="relative w-32">
                                                                <input
                                                                    placeholder="Icon Name/URL"
                                                                    value={item.icon || ''}
                                                                    onChange={e => {
                                                                        const newCats = [...formData.featureCategories]
                                                                        newCats[catIdx].items[itemIdx].icon = e.target.value
                                                                        setFormData(p => ({ ...p, featureCategories: newCats }))
                                                                    }}
                                                                    className="w-full px-2 py-1 bg-secondary border border-border rounded text-xs pr-7"
                                                                />
                                                                <label className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 text-muted-foreground hover:text-primary">
                                                                    {uploadingItem?.catIdx === catIdx && uploadingItem?.itemIdx === itemIdx ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <Upload className="h-3 w-3" />
                                                                    )}
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleItemIconUpload(e, catIdx, itemIdx)} />
                                                                </label>
                                                            </div>
                                                            <input
                                                                placeholder="Feature Text"
                                                                value={item.name}
                                                                onChange={e => {
                                                                    const newCats = [...formData.featureCategories]
                                                                    newCats[catIdx].items[itemIdx].name = e.target.value
                                                                    setFormData(p => ({ ...p, featureCategories: newCats }))
                                                                }}
                                                                className="flex-1 px-2 py-1 bg-secondary border border-border rounded text-xs"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newCats = [...formData.featureCategories]
                                                                    newCats[catIdx].items = newCats[catIdx].items.filter((_, i) => i !== itemIdx)
                                                                    setFormData(p => ({ ...p, featureCategories: newCats }))
                                                                }}
                                                                className="text-red-500"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newCats = [...formData.featureCategories]
                                                            newCats[catIdx].items.push({ name: '', icon: '' })
                                                            setFormData(p => ({ ...p, featureCategories: newCats }))
                                                        }}
                                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                                    >
                                                        <Plus className="h-3 w-3" /> Add Item
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* New Fields */}
                                <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    <p className="text-sm font-semibold text-primary">Advanced Pricing Card Fields</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Badge Text</label>
                                            <input
                                                type="text"
                                                value={formData.badgeText}
                                                onChange={e => setFormData(p => ({ ...p, badgeText: e.target.value }))}
                                                placeholder="e.g., 50%"
                                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium">App Integration Icons</label>
                                            <button type="button" onClick={addAppIntegration} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20">Add</button>
                                        </div>
                                        <div className="space-y-2">
                                            {(formData.appIntegrationIcons || []).map((icon, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            value={icon}
                                                            onChange={e => updateAppIntegration(idx, e.target.value)}
                                                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm pr-10"
                                                            placeholder="Icon URL or Name"
                                                        />
                                                        <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-primary">
                                                            {uploadingIntegration === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAppIntegrationUpload(e, idx)} />
                                                        </label>
                                                    </div>
                                                    <button type="button" onClick={() => removeAppIntegration(idx)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"><X className="h-4 w-4" /></button>
                                                </div>
                                            ))}
                                            {(formData.appIntegrationIcons || []).length === 0 && (
                                                <p className="text-xs text-muted-foreground italic">No integration icons added.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium">Platform Icons</label>
                                            <button type="button" onClick={addPlatformIcon} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20">Add</button>
                                        </div>
                                        <div className="space-y-2">
                                            {(formData.platformIcons || []).map((icon, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            value={icon}
                                                            onChange={e => updatePlatformIcon(idx, e.target.value)}
                                                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm pr-10"
                                                            placeholder="Icon URL or Name"
                                                        />
                                                        <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-primary">
                                                            {uploadingPlatform === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePlatformIconUpload(e, idx)} />
                                                        </label>
                                                    </div>
                                                    <button type="button" onClick={() => removePlatformIcon(idx)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"><X className="h-4 w-4" /></button>
                                                </div>
                                            ))}
                                            {(formData.platformIcons || []).length === 0 && (
                                                <p className="text-xs text-muted-foreground italic">No platform icons added.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Discount Field */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Discount %</label>
                                        <input
                                            type="number"
                                            value={formData.discount}
                                            onChange={e => setFormData(p => ({ ...p, discount: e.target.value }))}
                                            placeholder="e.g., 20 for 20% off"
                                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Enter discount percentage to apply on this membership.</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Additional Content Sections</p>
                                            <p className="text-xs text-muted-foreground">Add extra content blocks for the membership page.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addSection}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Section
                                        </button>
                                    </div>

                                    {formData.additionalSections.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                                            No additional sections yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.additionalSections.map((section, index) => (
                                                <div key={`section-${index}`} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium">Section {index + 1}</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSection(index)}
                                                            className="text-xs text-red-500 hover:text-red-400"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">Heading</label>
                                                            <input
                                                                type="text"
                                                                value={section.heading || ''}
                                                                onChange={(e) => updateSection(index, 'heading', e.target.value)}
                                                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">Title</label>
                                                            <input
                                                                type="text"
                                                                value={section.title || ''}
                                                                onChange={(e) => updateSection(index, 'title', e.target.value)}
                                                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Text</label>
                                                        <textarea
                                                            value={section.text || ''}
                                                            onChange={(e) => updateSection(index, 'text', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm resize-none"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">Image URL</label>
                                                            <input
                                                                type="url"
                                                                value={section.imageUrl || ''}
                                                                onChange={(e) => updateSection(index, 'imageUrl', e.target.value)}
                                                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium mb-1">Video URL</label>
                                                            <input
                                                                type="url"
                                                                value={section.videoUrl || ''}
                                                                onChange={(e) => updateSection(index, 'videoUrl', e.target.value)}
                                                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Quote</label>
                                                        <textarea
                                                            value={section.quote || ''}
                                                            onChange={(e) => updateSection(index, 'quote', e.target.value)}
                                                            rows={2}
                                                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm resize-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Embed HTML</label>
                                                        <textarea
                                                            value={section.embedHtml || ''}
                                                            onChange={(e) => updateSection(index, 'embedHtml', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm font-mono resize-none"
                                                            placeholder="<iframe ... />"
                                                        />
                                                    </div>
                                                    <div>
                                                        <ThumbnailUpload
                                                            currentUrl={section.imageUrl}
                                                            onUploadComplete={(url) => updateSection(index, 'imageUrl', url)}
                                                            label="Section Image Upload"
                                                            description="Upload an image for this section (max 10MB)"
                                                            inputId={`membership-section-image-${index}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4" />
                                    <span className="text-sm">Active</span>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50">
                                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {isEditing ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    )
}
