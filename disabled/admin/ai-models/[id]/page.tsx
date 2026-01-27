'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, EyeOff, TestTube2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { AiModel } from '@/lib/types/ai-models'

const providerOptions = ['openai', 'anthropic', 'google', 'deepseek', 'custom']

export default function EditAiModelPage() {
    const params = useParams()
    const [model, setModel] = useState<Partial<AiModel> | null>(null)
    const [formData, setFormData] = useState({
        provider: 'openai',
        model_name: '',
        display_name: '',
        description: '',
        api_endpoint: '',
        model_id: '',
        supports_streaming: true,
        supports_functions: false,
        supports_vision: false,
        default_temperature: 0.7,
        default_max_tokens: 2000,
        default_top_p: 1.0,
        price_per_1k_input: '',
        price_per_1k_output: '',
        currency: 'USD',
        is_active: false,
        display_order: 0,
        api_key: '' // New API key (optional)
    })
    const [showApiKey, setShowApiKey] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (params.id) {
            fetchModel()
        }
    }, [params.id])

    const fetchModel = async () => {
        const { data, error } = await supabase
            .from('ai_models')
            .select('*')
            .eq('id', params.id)
            .single()

        if (!error && data) {
            setModel(data)
            setFormData({
                provider: data.provider,
                model_name: data.model_name,
                display_name: data.display_name,
                description: data.description || '',
                api_endpoint: data.api_endpoint || '',
                model_id: data.model_id,
                supports_streaming: data.supports_streaming,
                supports_functions: data.supports_functions,
                supports_vision: data.supports_vision,
                default_temperature: data.default_temperature,
                default_max_tokens: data.default_max_tokens,
                default_top_p: data.default_top_p,
                price_per_1k_input: data.price_per_1k_input?.toString() || '',
                price_per_1k_output: data.price_per_1k_output?.toString() || '',
                currency: data.currency,
                is_active: data.is_active,
                display_order: data.display_order,
                api_key: ''
            })
        }
        setLoading(false)
    }

    const handleTestConnection = async () => {
        setTesting(true)
        try {
            const response = await fetch('/api/ai-models/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelId: params.id })
            })

            const result = await response.json()

            if (result.success) {
                alert(`✓ Connection successful!\nResponse time: ${result.responseTime}ms`)
                await fetchModel() // Refresh to get updated status
            } else {
                alert(`✗ Connection failed:\n${result.message}`)
            }
        } catch (error) {
            alert('Failed to test connection')
        } finally {
            setTesting(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSaving(true)
        setError('')

        try {
            const response = await fetch('/api/ai-models', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: params.id,
                    ...formData,
                    price_per_1k_input: formData.price_per_1k_input ? parseFloat(formData.price_per_1k_input as string) : null,
                    price_per_1k_output: formData.price_per_1k_output ? parseFloat(formData.price_per_1k_output as string) : null,
                    // Only include API key if it's been changed
                    api_key: formData.api_key.trim() ? formData.api_key : undefined
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update model')
            }

            router.push('/admin/ai-models')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update model')
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!model) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Model not found</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ai-models" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit AI Model</h1>
                        <p className="text-muted-foreground mt-1">{model.display_name}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-60"
                >
                    <TestTube2 className={`h-5 w-5 ${testing ? 'animate-pulse' : ''}`} />
                    {testing ? 'Testing...' : 'Test Connection'}
                </button>
            </div>

            {model.connection_status && (
                <div className={`p-4 rounded-lg ${model.connection_status === 'connected'
                        ? 'bg-green-500/10 border border-green-500/20'
                        : model.connection_status === 'failed'
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                    <p className="text-sm">
                        Status: <span className="font-medium capitalize">{model.connection_status}</span>
                        {model.last_tested_at && (
                            <span className="text-muted-foreground ml-2">
                                (Last tested: {new Date(model.last_tested_at).toLocaleString()})
                            </span>
                        )}
                    </p>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Provider *</label>
                            <select
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                {providerOptions.map(option => (
                                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Model Name *</label>
                            <input
                                type="text"
                                value={formData.model_name}
                                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Display Name *</label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Model ID *</label>
                            <input
                                type="text"
                                value={formData.model_id}
                                onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">API Endpoint *</label>
                            <input
                                type="text"
                                value={formData.api_endpoint}
                                onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">API Key (leave blank to keep existing)</label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={formData.api_key}
                                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                    className="w-full px-4 py-3 pr-12 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter new API key or leave blank"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Model Capabilities</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <input
                                id="streaming"
                                type="checkbox"
                                checked={formData.supports_streaming}
                                onChange={(e) => setFormData({ ...formData, supports_streaming: e.target.checked })}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="streaming" className="text-sm text-foreground">Supports Streaming</label>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="functions"
                                type="checkbox"
                                checked={formData.supports_functions}
                                onChange={(e) => setFormData({ ...formData, supports_functions: e.target.checked })}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="functions" className="text-sm text-foreground">Supports Functions</label>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="vision"
                                type="checkbox"
                                checked={formData.supports_vision}
                                onChange={(e) => setFormData({ ...formData, supports_vision: e.target.checked })}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="vision" className="text-sm text-foreground">Supports Vision</label>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Default Parameters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Temperature</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="2"
                                value={formData.default_temperature}
                                onChange={(e) => setFormData({ ...formData, default_temperature: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Max Tokens</label>
                            <input
                                type="number"
                                value={formData.default_max_tokens}
                                onChange={(e) => setFormData({ ...formData, default_max_tokens: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Top P</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={formData.default_top_p}
                                onChange={(e) => setFormData({ ...formData, default_top_p: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-foreground">Pricing & Status</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Input Price (per 1K tokens)</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.price_per_1k_input}
                                onChange={(e) => setFormData({ ...formData, price_per_1k_input: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Output Price (per 1K tokens)</label>
                            <input
                                type="number"
                                step="0.000001"
                                value={formData.price_per_1k_output}
                                onChange={(e) => setFormData({ ...formData, price_per_1k_output: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Display Order</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="isActive"
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="isActive" className="text-sm text-foreground">
                                Active (visible in workspace)
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
