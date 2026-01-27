'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Edit, Plus, Search, Sparkles, Trash2, CheckCircle, XCircle, TestTube2 } from 'lucide-react'
import type { AiModel } from '@/lib/types/ai-models'

export default function AiModelsAdminPage() {
    const [models, setModels] = useState<AiModel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [testingModel, setTestingModel] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchModels()
    }, [])

    const fetchModels = async () => {
        const { data, error } = await supabase
            .from('ai_models')
            .select('*')
            .order('display_order', { ascending: true })

        if (!error && data) {
            setModels(data)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('ai_models')
            .delete()
            .eq('id', id)

        if (!error) {
            setModels(models.filter(model => model.id !== id))
        }
        setDeleteConfirm(null)
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('ai_models')
            .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            setModels(models.map(model =>
                model.id === id ? { ...model, is_active: !currentStatus } : model
            ))
        }
    }

    const testConnection = async (modelId: string) => {
        setTestingModel(modelId)

        try {
            const response = await fetch('/api/ai-models/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelId })
            })

            const result = await response.json()

            // Refresh models to get updated connection status
            await fetchModels()

            if (result.success) {
                alert(`✓ Connection successful!\nResponse time: ${result.responseTime}ms`)
            } else {
                alert(`✗ Connection failed:\n${result.message}`)
            }
        } catch (error) {
            alert('Failed to test connection')
        } finally {
            setTestingModel(null)
        }
    }

    const filteredModels = models.filter(model =>
        model.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.model_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getProviderColor = (provider: string) => {
        const colors: Record<string, string> = {
            openai: 'text-emerald-500',
            anthropic: 'text-amber-500',
            google: 'text-blue-500',
            deepseek: 'text-purple-500',
            custom: 'text-gray-500'
        }
        return colors[provider] || 'text-gray-500'
    }

    const getStatusBadge = (status: string | null) => {
        if (!status || status === 'not_tested') {
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-500/10 text-gray-500">
                    Not Tested
                </span>
            )
        }
        if (status === 'connected') {
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                </span>
            )
        }
        return (
            <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Failed
            </span>
        )
    }

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
                    <h1 className="text-3xl font-bold text-foreground">AI Models</h1>
                    <p className="text-muted-foreground mt-1">Manage AI model configurations and API keys</p>
                </div>
                <Link
                    href="/admin/ai-models/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    New Model
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search models..."
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
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Model</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Provider</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Connection</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredModels.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        {searchQuery ? 'No models found' : 'No models yet. Create your first AI model!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredModels.map((model) => (
                                    <tr key={model.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-foreground">{model.display_name}</p>
                                                <p className="text-xs text-muted-foreground">{model.model_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium capitalize ${getProviderColor(model.provider)}`}>
                                                {model.provider}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(model.id, model.is_active)}
                                                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${model.is_active
                                                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                                    }`}
                                            >
                                                {model.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(model.connection_status)}
                                                <button
                                                    onClick={() => testConnection(model.id)}
                                                    disabled={testingModel === model.id}
                                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                                                    title="Test Connection"
                                                >
                                                    <TestTube2 className={`h-4 w-4 ${testingModel === model.id ? 'animate-pulse' : ''}`} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/ai-models/${model.id}`}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(model.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete AI Model</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this model? This action cannot be undone.
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
