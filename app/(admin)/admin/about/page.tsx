'use client'

import React, { useEffect, useState } from 'react'
import { Save, Plus, Trash2, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import ThumbnailUpload from '@/components/thumbnail-upload'

interface AboutData {
    hero: {
        title: string;
        description: string;
    };
    story: {
        title: string;
        content: string[];
    };
    values: {
        title: string;
        description: string;
        icon: string;
    }[];
    seo: {
        title: string;
        description: string;
    };
}

const initialData: AboutData = {
    hero: { title: '', description: '' },
    story: { title: '', content: [''] },
    values: [],
    seo: { title: '', description: '' }
}

const ICONS = ['Target', 'Users', 'Zap', 'Award', 'Heart', 'Globe', 'Shield', 'Smile']

export default function AdminAboutPage() {
    const [data, setData] = useState<AboutData>(initialData)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/about')
            if (res.ok) {
                const fetchedData = await res.json()
                if (Object.keys(fetchedData).length > 0) {
                    setData(fetchedData)
                }
            }
        } catch (error) {
            console.error('Failed to fetch about data', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/admin/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                toast.success('About page updated successfully')
                fetchData() // Refresh to ensure sync
            } else {
                throw new Error('Failed to update')
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    const updateStoryContent = (index: number, value: string) => {
        const newContent = [...data.story.content]
        newContent[index] = value
        setData(prev => ({ ...prev, story: { ...prev.story, content: newContent } }))
    }

    const addStoryParagraph = () => {
        setData(prev => ({ ...prev, story: { ...prev.story, content: [...prev.story.content, ''] } }))
    }

    const removeStoryParagraph = (index: number) => {
        const newContent = data.story.content.filter((_, i) => i !== index)
        setData(prev => ({ ...prev, story: { ...prev.story, content: newContent } }))
    }

    const addValue = () => {
        setData(prev => ({
            ...prev,
            values: [...prev.values, { title: 'New Value', description: '', icon: 'Target' }]
        }))
    }

    const removeValue = (index: number) => {
        const newValues = data.values.filter((_, i) => i !== index)
        setData(prev => ({ ...prev, values: newValues }))
    }

    const updateValue = (index: number, field: keyof typeof data.values[0], value: string) => {
        const newValues = [...data.values]
        newValues[index] = { ...newValues[index], [field]: value }
        setData(prev => ({ ...prev, values: newValues }))
    }

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">About Page</h1>
                    <p className="text-muted-foreground mt-1">Manage content for the About Us page</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Hero Section */}
                <section className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Hero Section
                    </h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Title</label>
                            <input
                                type="text"
                                value={data.hero.title}
                                onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Description</label>
                            <textarea
                                value={data.hero.description}
                                onChange={e => setData(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                                rows={3}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Our Story</h2>
                        <button type="button" onClick={addStoryParagraph} className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Plus className="h-4 w-4" /> Add Paragraph
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Section Title</label>
                        <input
                            type="text"
                            value={data.story.title}
                            onChange={e => setData(prev => ({ ...prev, story: { ...prev.story, title: e.target.value } }))}
                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg mb-4 focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                    <div className="space-y-3">
                        {data.story.content.map((paragraph, index) => (
                            <div key={index} className="flex gap-2">
                                <textarea
                                    value={paragraph}
                                    onChange={e => updateStoryContent(index, e.target.value)}
                                    rows={3}
                                    className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder={`Paragraph ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeStoryParagraph(index)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg h-fit"
                                    title="Remove paragraph"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Values Section */}
                <section className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Values</h2>
                        <button type="button" onClick={addValue} className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Plus className="h-4 w-4" /> Add Value
                        </button>
                    </div>
                    <div className="grid gap-6">
                        {data.values.map((value, index) => (
                            <div key={index} className="flex gap-4 p-4 bg-secondary/20 rounded-lg border border-border relative group">
                                <div className="flex-1 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-muted-foreground">Title</label>
                                        <input
                                            type="text"
                                            value={value.title}
                                            onChange={e => updateValue(index, 'title', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-muted-foreground">Icon</label>
                                        <select
                                            value={value.icon}
                                            onChange={e => updateValue(index, 'icon', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm"
                                        >
                                            {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium mb-1 text-muted-foreground">Description</label>
                                        <input
                                            type="text"
                                            value={value.description}
                                            onChange={e => updateValue(index, 'description', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeValue(index)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg self-start"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {data.values.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No values added yet.</p>
                        )}
                    </div>
                </section>

                {/* SEO Section */}
                <section className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold">SEO Settings</h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Meta Title</label>
                            <input
                                type="text"
                                value={data.seo.title}
                                onChange={e => setData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Meta Description</label>
                            <textarea
                                value={data.seo.description}
                                onChange={e => setData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                                rows={2}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg resize-none"
                            />
                        </div>
                    </div>
                </section>
            </form>
        </div>
    )
}
