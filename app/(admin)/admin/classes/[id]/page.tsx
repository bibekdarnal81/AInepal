'use client'

import React, { useEffect, useState, use } from 'react'
import {
    Loader2,
    X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThumbnailUpload from '@/components/thumbnail-upload'
import { RichTextEditor } from '@/components/rich-text-editor'

interface ClassFormData {
    title: string
    slug: string
    description: string
    instructor: string
    price: number
    currency: string
    duration: string
    schedule: string
    level: string
    maxStudents: number
    summary: string
    thumbnailUrl: string
    isActive: boolean
    isFeatured: boolean
    startDate: string
}

const initialFormData: ClassFormData = {
    title: '',
    slug: '',
    description: '',
    instructor: '',
    price: 0,
    currency: 'NPR',
    duration: '',
    schedule: '',
    level: 'Beginner',
    maxStudents: 30,
    summary: '',
    thumbnailUrl: '',
    isActive: true,
    isFeatured: false,
    startDate: ''
}

export default function AdminEditClassPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [formData, setFormData] = useState<ClassFormData>(initialFormData)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const res = await fetch(`/api/admin/classes/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        description: data.description || '',
                        instructor: data.instructor || '',
                        price: data.price || 0,
                        currency: data.currency || 'NPR',
                        duration: data.duration || '',
                        schedule: data.schedule || '',
                        level: data.level || 'Beginner',
                        maxStudents: data.maxStudents || 30,
                        summary: data.summary || '',
                        thumbnailUrl: data.thumbnailUrl || '',
                        isActive: data.isActive,
                        isFeatured: data.isFeatured || false,
                        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : ''
                    })
                } else {
                    alert('Failed to load class')
                    router.push('/admin/classes')
                }
            } catch (error) {
                console.error('Error loading class:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchClass()
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch(`/api/admin/classes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push('/admin/classes')
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to update class')
            }
        } catch (error) {
            console.error('Error updating class:', error)
            alert('Failed to update class')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Class</h1>
                <Link
                    href="/admin/classes"
                    className="p-2 hover:bg-secondary rounded-lg"
                >
                    <X className="h-5 w-5" />
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-6 rounded-xl">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1.5">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1.5">Slug *</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                required
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Instructor</label>
                            <input
                                type="text"
                                value={formData.instructor}
                                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="All Levels">All Levels</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Schedule & Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Price</label>
                            <div className="flex gap-2">
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                    className="px-3 py-2 bg-secondary/50 border border-border rounded-lg w-24"
                                >
                                    <option value="NPR">NPR</option>
                                    <option value="USD">USD</option>
                                </select>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                    className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Max Students</label>
                            <input
                                type="number"
                                value={formData.maxStudents}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Duration</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Schedule</label>
                            <input
                                type="text"
                                value={formData.schedule}
                                onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Content</h2>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Summary (Short Description)</label>
                        <textarea
                            value={formData.summary}
                            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            placeholder="Brief summary for listings..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Full Description</label>
                        <RichTextEditor
                            content={formData.description}
                            onChange={(description) => setFormData(prev => ({ ...prev, description }))}
                            placeholder="Detailed course description..."
                            minHeight="300px"
                        />
                    </div>

                    <div>
                        <ThumbnailUpload
                            currentUrl={formData.thumbnailUrl}
                            onUploadComplete={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                            label="Class Thumbnail"
                            description="Upload a cover image (max 10MB)"
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Settings</h2>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-border accent-primary"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium">Active (Visible)</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                className="h-4 w-4 rounded border-border accent-primary"
                            />
                            <label htmlFor="isFeatured" className="text-sm font-medium">Featured</label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Link
                        href="/admin/classes"
                        className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Update Class
                    </button>
                </div>

            </form>
        </div>
    )
}
