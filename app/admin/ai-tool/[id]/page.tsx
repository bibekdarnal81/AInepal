'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const iconOptions = [
    'MessageSquare',
    'Code2',
    'Image',
    'PenLine',
    'FileText',
    'Mail',
    'FileSearch',
    'Database',
    'Scan',
    'Languages',
    'LayoutTemplate',
    'BookOpen',
    'Wallet',
    'CheckCircle2',
    'Users',
    'ClipboardList',
    'ListChecks',
    'ChefHat',
    'Share2',
    'Activity',
]

interface AiTool {
    id: string
    name: string
    description: string | null
    icon: string | null
    category: string | null
    is_active: boolean
    display_order: number
}

export default function EditAiToolPage() {
    const [tool, setTool] = useState<AiTool | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [icon, setIcon] = useState('MessageSquare')
    const [category, setCategory] = useState('')
    const [displayOrder, setDisplayOrder] = useState('0')
    const [isActive, setIsActive] = useState(true)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()
    const params = useParams<{ id?: string }>()
    const supabase = createClient()

    useEffect(() => {
        if (!params?.id) {
            setError('Missing tool id in route.')
            setLoading(false)
            return
        }

        const fetchTool = async () => {
            const { data, error } = await supabase
                .from('ai_tools')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error || !data) {
                setError(error?.message || 'Tool not found')
                setLoading(false)
                return
            }

            setTool(data)
            setName(data.name || '')
            setDescription(data.description || '')
            setIcon(data.icon || 'MessageSquare')
            setCategory(data.category || '')
            setDisplayOrder(String(data.display_order ?? 0))
            setIsActive(Boolean(data.is_active))
            setLoading(false)
        }

        fetchTool()
    }, [params.id])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!tool) return
        setSaving(true)
        setError('')

        const { error: updateError } = await supabase
            .from('ai_tools')
            .update({
                name: name.trim(),
                description: description.trim() || null,
                icon: icon.trim() || null,
                category: category.trim() || null,
                is_active: isActive,
                display_order: parseInt(displayOrder) || 0,
                updated_at: new Date().toISOString(),
            })
            .eq('id', tool.id)

        if (updateError) {
            setError(updateError.message)
            setSaving(false)
            return
        }

        router.push('/admin/ai-tool')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/ai-tool" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit AI Tool</h1>
                    <p className="text-muted-foreground mt-1">Update tool details and visibility</p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Icon</label>
                            <select
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {iconOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Display Order</label>
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                min="0"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="isActive"
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="isActive" className="text-sm text-foreground">
                                Active (visible on workspace pages)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
