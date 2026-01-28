'use client'

import React, { useEffect, useState } from 'react'
import { Key, Plus, Trash2, Copy, Check, Loader2 } from 'lucide-react'

interface ApiKey {
    id: string
    name: string
    key: string // Masked or full depending on context
    lastUsedAt?: string
    expiresAt?: string
    createdAt: string
    user?: {
        email: string
        displayName: string
        isSuspended?: boolean
    }
    isActive: boolean
}

export default function ApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [newKey, setNewKey] = useState<{ name: string, key: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({ name: '', allowedDomains: '' })

    // Fetch API Keys
    const fetchApiKeys = async () => {
        setLoading(true)
        setSelectedIds(new Set())
        try {
            const res = await fetch('/api/admin/api-keys')
            const data = await res.json()
            if (res.ok) {
                setApiKeys(data.apiKeys)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApiKeys()
    }, [])

    const handleGenerateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!createForm.name) return

        setGenerating(true)
        try {
            const domains = createForm.allowedDomains
                .split(',')
                .map(d => d.trim())
                .filter(d => d.length > 0)

            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: createForm.name,
                    allowedDomains: domains
                })
            })
            const data = await res.json()
            if (res.ok) {
                setNewKey({ name: data.apiKey.name, key: data.apiKey.key })
                setShowCreateModal(false)
                setCreateForm({ name: '', allowedDomains: '' })
                fetchApiKeys()
            } else {
                alert(data.error || 'Failed to generate key')
            }
        } catch (e) {
            console.error(e)
            alert('An error occurred')
        } finally {
            setGenerating(false)
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive: !currentStatus } : k))

            const res = await fetch(`/api/admin/api-keys/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            })

            if (!res.ok) {
                // Revert on failure
                setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive: currentStatus } : k))
                alert('Failed to update status')
            }
        } catch (e) {
            console.error(e)
            alert('An error occurred')
            // Revert on failure
            setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive: currentStatus } : k))
        }
    }

    const handleDeleteKey = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API Key? Any application using it will verify immediately fail.')) return

        try {
            const res = await fetch(`/api/admin/api-keys/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchApiKeys()
            } else {
                alert('Failed to revoke key')
            }
        } catch (e) {
            console.error(e)
            alert('An error occurred')
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} API keys?`)) return

        try {
            const res = await fetch('/api/admin/api-keys', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            })

            if (res.ok) {
                fetchApiKeys()
            } else {
                alert('Failed to delete selected keys')
            }
        } catch (e) {
            console.error(e)
            alert('An error occurred')
        }
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === apiKeys.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(apiKeys.map(k => k.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">API Keys</h1>
                    <p className="text-muted-foreground mt-1">Manage API keys for external applications</p>
                </div>
                {selectedIds.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete ({selectedIds.size})
                    </button>
                )}
            </div>

            {/* Create API Key Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Generate New API Key</h2>
                        <form onSubmit={handleGenerateKey} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Website, Mobile App"
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={createForm.name}
                                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Allowed Domains <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Comma separated (e.g. example.com, app.example.com). Leave empty to allow all.
                                </p>
                                <input
                                    type="text"
                                    placeholder="example.com, localhost"
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={createForm.allowedDomains}
                                    onChange={e => setCreateForm({ ...createForm, allowedDomains: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Generate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Key Modal / Alert */}
            {newKey && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-500/20 p-2 rounded-full">
                            <Key className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-lg text-green-600 dark:text-green-400">API Key Generated Successfully</h3>
                            <p className="text-sm text-foreground/80">
                                This is the only time the full key will be shown. Please copy it now and store it securely.
                            </p>
                            <div className="flex items-center gap-2 mt-4 bg-background border border-border p-3 rounded-lg">
                                <code className="flex-1 font-mono text-sm break-all">{newKey.key}</code>
                                <button
                                    onClick={() => copyToClipboard(newKey.key)}
                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                            <button
                                onClick={() => setNewKey(null)}
                                className="text-sm text-muted-foreground hover:text-foreground mt-2 underline"
                            >
                                I have saved the key securely
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={generating}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Generate New Key
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : apiKeys.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center px-4">
                        <Key className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No API keys found</h3>
                        <p className="text-muted-foreground max-w-sm mt-1">
                            Generate an API key to allow external applications to connect to your platform.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === apiKeys.length && apiKeys.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 mx-auto block"
                                    />
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Key Prefix</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Created By</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Last Used</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Created At</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {apiKeys.map(key => (
                                <tr key={key.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(key.id)}
                                            onChange={() => toggleSelect(key.id)}
                                            className="rounded border-gray-300 mx-auto block"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-medium">{key.name}</td>
                                    <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{key.key}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{key.user?.displayName || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{key.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() + ' ' + new Date(key.lastUsedAt).toLocaleTimeString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(key.id, key.isActive)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${key.isActive ? 'bg-primary' : 'bg-input'}`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-background transition-transform ${key.isActive ? 'translate-x-5' : 'translate-x-1'}`}
                                                />
                                            </button>

                                            {key.user?.isSuspended ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/20">
                                                    Banned
                                                </span>
                                            ) : !key.isActive ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500 ring-1 ring-inset ring-gray-500/20">
                                                    Disabled
                                                </span>
                                            ) : key.expiresAt && new Date(key.expiresAt) < new Date() ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                                                    Expired
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 ring-1 ring-inset ring-green-500/20">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(key.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDeleteKey(key.id)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
