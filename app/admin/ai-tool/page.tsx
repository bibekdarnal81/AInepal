'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Edit, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import * as Icons from 'lucide-react'

interface AiTool {
    id: string
    name: string
    description: string | null
    icon: string | null
    category: string | null
    is_active: boolean
    display_order: number
}

export default function AiToolsAdminPage() {
    const [tools, setTools] = useState<AiTool[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchTools()
    }, [])

    const fetchTools = async () => {
        const { data, error } = await supabase
            .from('ai_tools')
            .select('*')
            .order('display_order', { ascending: true })

        if (!error && data) {
            setTools(data)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('ai_tools')
            .delete()
            .eq('id', id)

        if (!error) {
            setTools(tools.filter(tool => tool.id !== id))
        }
        setDeleteConfirm(null)
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('ai_tools')
            .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            setTools(tools.map(tool =>
                tool.id === id ? { ...tool, is_active: !currentStatus } : tool
            ))
        }
    }

    const filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">AI Tools</h1>
                    <p className="text-muted-foreground mt-1">Manage the AI Suite tools shown in workspace pages</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/ai-models"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                    >
                        AI Models
                    </Link>
                    <Link
                        href="/admin/ai-tool/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        New Tool
                    </Link>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Tool</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Order</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTools.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        {searchQuery ? 'No tools found' : 'No tools yet. Create your first AI tool!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTools.map((tool) => {
                                    const IconComponent = tool.icon && (Icons as any)[tool.icon]
                                        ? (Icons as any)[tool.icon]
                                        : Sparkles
                                    return (
                                        <tr key={tool.id} className="hover:bg-secondary/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-secondary/60 flex items-center justify-center">
                                                        <IconComponent className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{tool.name}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                            {tool.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {tool.category || 'General'}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {tool.display_order}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleActive(tool.id, tool.is_active)}
                                                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${tool.is_active
                                                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                                        }`}
                                                >
                                                    {tool.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/ai-tool/${tool.id}`}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(tool.id)}
                                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete AI Tool</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this tool? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
