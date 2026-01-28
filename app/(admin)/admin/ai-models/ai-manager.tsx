"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Plus, Key, Bot, Trash2, Pencil, X } from "lucide-react"
import ThumbnailUpload from "@/components/thumbnail-upload"

interface AIModel {
    _id: string
    provider: string
    modelName: string
    displayName: string
    modelId: string
    description?: string
    image?: string
    apiEndpoint?: string
    supportsStreaming?: boolean
    supportsVision?: boolean
    supportsImageGeneration?: boolean
    supportsVideoGeneration?: boolean
    isActive: boolean
    disabled?: boolean
    availableInVSCode?: boolean
    adminMessage?: string
}

interface AIKey {
    _id: string
    provider: string
    maskedKey: string
}

export function AiManager({ initialModels, initialKeys }: { initialModels: AIModel[], initialKeys: AIKey[] }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'models' | 'keys'>('models')
    const [models, setModels] = useState(initialModels)
    const [keys, setKeys] = useState(initialKeys)
    const [loading, setLoading] = useState(false)
    const [filterType, setFilterType] = useState('all')

    // Form States
    const [newModel, setNewModel] = useState({
        provider: 'openai',
        modelName: '',
        displayName: '',
        modelId: '',
        description: '',
        image: '',
        apiEndpoint: '',
        supportsStreaming: true,
        supportsVision: false,
        supportsImageGeneration: false,
        supportsVideoGeneration: false,
        disabled: false,
        availableInVSCode: true,
        adminMessage: ''
    })

    const [editingModel, setEditingModel] = useState<string | null>(null)

    const [newKey, setNewKey] = useState({
        provider: 'openai',
        apiKey: ''
    })

    async function handleAddModel(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const url = editingModel ? '/api/admin/ai-models' : '/api/admin/ai-models'
            const method = editingModel ? 'PUT' : 'POST'
            const body = editingModel ? { ...newModel, _id: editingModel } : newModel

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error(editingModel ? 'Failed to update model' : 'Failed to add model')

            const savedModel = await res.json()

            if (editingModel) {
                setModels(models.map(m => m._id === editingModel ? savedModel : m))
                setEditingModel(null)
            } else {
                setModels([...models, savedModel])
            }

            setNewModel({
                provider: 'openai',
                modelName: '',
                displayName: '',
                modelId: '',
                description: '',
                image: '',
                apiEndpoint: '',
                supportsStreaming: true,
                supportsVision: false,
                supportsImageGeneration: false,
                supportsVideoGeneration: false,
                disabled: false,
                availableInVSCode: true,
                adminMessage: ''
            })
            router.refresh()
        } catch (error) {
            alert(editingModel ? 'Error updating model' : 'Error adding model')
        } finally {
            setLoading(false)
        }
    }

    function handleEditModel(model: AIModel) {
        setEditingModel(model._id)
        setNewModel({
            provider: model.provider,
            modelName: model.modelName,
            displayName: model.displayName,
            modelId: model.modelId,
            description: model.description || '',
            image: model.image || '',
            apiEndpoint: model.apiEndpoint || '',
            supportsStreaming: model.supportsStreaming ?? true,
            supportsVision: model.supportsVision ?? false,
            supportsImageGeneration: model.supportsImageGeneration ?? false,
            supportsVideoGeneration: model.supportsVideoGeneration ?? false,
            disabled: model.disabled ?? false,
            availableInVSCode: model.availableInVSCode ?? true,
            adminMessage: model.adminMessage || ''
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function cancelEdit() {
        setEditingModel(null)
        setNewModel({
            provider: 'openai',
            modelName: '',
            displayName: '',
            modelId: '',
            description: '',
            image: '',
            apiEndpoint: '',
            supportsStreaming: true,
            supportsVision: false,
            supportsImageGeneration: false,
            supportsVideoGeneration: false,
            disabled: false,
            availableInVSCode: true,
            adminMessage: ''
        })
    }

    async function handleAddKey(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/admin/ai-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKey)
            })
            if (!res.ok) throw new Error('Failed to save key')

            // Re-fetch keys or just reload page to get masked version
            location.reload()
        } catch (error) {
            alert('Error saving key')
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteModel(id: string) {
        if (!confirm('Are you sure you want to remove this model?')) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/ai-models?id=${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete model')

            setModels(models.filter(m => m._id !== id))
            router.refresh()
        } catch (error) {
            alert('Error deleting model')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex space-x-4 border-b border-border pb-2">
                <button
                    onClick={() => setActiveTab('models')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'models' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    AI Models
                </button>
                <button
                    onClick={() => setActiveTab('keys')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'keys' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    API Keys
                </button>
            </div>

            {activeTab === 'models' && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Add Model Form */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                {editingModel ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {editingModel ? 'Edit Model' : 'Add New Model'}
                            </span>
                            {editingModel && (
                                <button
                                    onClick={cancelEdit}
                                    className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground bg-secondary/50 px-2 py-1 rounded"
                                >
                                    <X className="w-3 h-3" /> Cancel
                                </button>
                            )}
                        </h3>
                        <form onSubmit={handleAddModel} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Provider</label>
                                <select
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg p-2.5 text-sm"
                                    value={newModel.provider}
                                    onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="google">Google Gemini</option>
                                    <option value="deepseek">DeepSeek</option>
                                    <option value="perplexity">Perplexity</option>
                                    <option value="mistral">Mistral</option>
                                    <option value="xai">xAI (Grok)</option>
                                    <option value="bedrock">AWS Bedrock</option>
                                    <option value="digitalocean">DigitalOcean</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. GPT-4.1 Mini"
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg p-2.5 text-sm"
                                    value={newModel.displayName}
                                    onChange={(e) => setNewModel({ ...newModel, displayName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <textarea
                                    placeholder="Brief description of the model..."
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg p-2.5 text-sm min-h-[80px]"
                                    value={newModel.description}
                                    onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Model ID (API Name)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. gpt-4.1-mini"
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg p-2.5 text-sm"
                                    value={newModel.modelId}
                                    onChange={(e) => setNewModel({ ...newModel, modelId: e.target.value, modelName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">API Endpoint (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. https://api.digitalocean.com/..."
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg p-2.5 text-sm"
                                    value={newModel.apiEndpoint}
                                    onChange={(e) => setNewModel({ ...newModel, apiEndpoint: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Required for providers like DigitalOcean (OpenAI-compatible)</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Model Icon (Optional)</label>
                                <div className="mt-1">
                                    <ThumbnailUpload
                                        currentUrl={newModel.image}
                                        onUploadComplete={(url) => setNewModel(prev => ({ ...prev, image: url }))}
                                        label=""
                                        description="Upload a logo for this model"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-2 flex-wrap">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={newModel.supportsStreaming}
                                        onChange={(e) => setNewModel({ ...newModel, supportsStreaming: e.target.checked })}
                                        className="rounded border-border bg-secondary"
                                    />
                                    Supports Streaming
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={newModel.supportsVision}
                                        onChange={(e) => setNewModel({ ...newModel, supportsVision: e.target.checked })}
                                        className="rounded border-border bg-secondary"
                                    />
                                    Supports Vision
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={newModel.supportsImageGeneration}
                                        onChange={(e) => setNewModel({ ...newModel, supportsImageGeneration: e.target.checked })}
                                        className="rounded border-border bg-secondary"
                                    />
                                    Image Generation
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={newModel.supportsVideoGeneration}
                                        onChange={(e) => setNewModel({ ...newModel, supportsVideoGeneration: e.target.checked })}
                                        className="rounded border-border bg-secondary"
                                    />
                                    Video Generation
                                </label>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={newModel.availableInVSCode}
                                        onChange={(e) => setNewModel({ ...newModel, availableInVSCode: e.target.checked })}
                                        className="rounded border-border bg-secondary"
                                    />
                                    Available in VS Code
                                </label>
                            </div>

                            {/* Disable Model Section */}
                            <div className="border-t border-border pt-4 mt-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={newModel.disabled}
                                        onChange={(e) => setNewModel({ ...newModel, disabled: e.target.checked })}
                                        className="rounded border-border bg-secondary accent-red-500"
                                    />
                                    <span className="text-red-500 font-medium">Disable this model</span>
                                </label>
                                <p className="text-xs text-muted-foreground mt-1 ml-5">Disabled models will not be available to users</p>
                            </div>

                            {newModel.disabled && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Admin Message (shown to users)</label>
                                    <textarea
                                        placeholder="e.g. This model is temporarily unavailable due to maintenance..."
                                        className="w-full mt-1 bg-secondary/50 border border-amber-500/50 rounded-lg p-2.5 text-sm min-h-[60px]"
                                        value={newModel.adminMessage}
                                        onChange={(e) => setNewModel({ ...newModel, adminMessage: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">This message will be displayed to users explaining why the model is unavailable</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> {editingModel ? 'Update Model' : 'Save Model'}</>}
                            </button>
                        </form>
                    </div>

                    {/* Models List */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Bot className="w-5 h-5" /> Models
                            </h3>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary"
                            >
                                <option value="all">All Models</option>
                                <option value="image">Image Generation</option>
                                <option value="video">Video Generation</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            {models.filter(m => {
                                if (filterType === 'image') return m.supportsImageGeneration;
                                if (filterType === 'video') return m.supportsVideoGeneration;
                                return true;
                            }).map(model => (
                                <div key={model._id} className={`flex items-center justify-between p-3 rounded-lg border group ${model.disabled ? 'bg-red-500/10 border-red-500/30' : 'bg-secondary/30 border-border/50'}`}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {model.image && (
                                                <img src={model.image} alt={model.displayName} className={`w-5 h-5 rounded-sm object-cover ${model.disabled ? 'opacity-50' : ''}`} />
                                            )}
                                            <p className={`font-medium text-sm ${model.disabled ? 'line-through text-muted-foreground' : ''}`}>{model.displayName}</p>
                                            {model.disabled && (
                                                <span className="text-xs bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded font-medium">DISABLED</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{model.provider} • {model.modelId}</p>
                                        {model.disabled && model.adminMessage && (
                                            <p className="text-xs text-amber-500 mt-1 truncate" title={model.adminMessage}>💬 {model.adminMessage}</p>
                                        )}
                                        {model.availableInVSCode && (
                                            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 mt-1 inline-block">VS Code</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`w-2 h-2 rounded-full ${model.disabled ? 'bg-red-500' : model.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                        <button
                                            onClick={() => handleEditModel(model)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors ml-2"
                                            title="Edit model"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteModel(model._id)}
                                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                            title="Remove model"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {models.filter(m => {
                                if (filterType === 'image') return m.supportsImageGeneration;
                                if (filterType === 'video') return m.supportsVideoGeneration;
                                return true;
                            }).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No matching models found.</p>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'keys' && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Add Key Form */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5" /> Update API Key
                        </h3>
                        <form onSubmit={handleAddKey} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Provider</label>
                                <select
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg p-2.5 text-sm"
                                    value={newKey.provider}
                                    onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="google">Google Gemini</option>
                                    <option value="deepseek">DeepSeek</option>
                                    <option value="perplexity">Perplexity</option>
                                    <option value="mistral">Mistral</option>
                                    <option value="xai">xAI (Grok)</option>
                                    <option value="bedrock">AWS Bedrock</option>
                                    <option value="digitalocean">DigitalOcean</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    {newKey.provider === 'bedrock' ? 'AWS Credentials' : 'API Key'}
                                </label>
                                <input
                                    type="password"
                                    placeholder={newKey.provider === 'bedrock' ? 'ACCESS_KEY:SECRET_KEY:REGION' : 'sk-...'}
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-lg p-2.5 text-sm"
                                    value={newKey.apiKey}
                                    onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                                    required
                                />
                                {newKey.provider === 'bedrock' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Format: ACCESS_KEY_ID:SECRET_ACCESS_KEY:REGION (e.g., AKIA...:wJalr...:us-east-1)
                                    </p>
                                )}
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-600 dark:text-yellow-400">
                                Keys are encrypted before storage (AES-256). Updating a key will overwrite the existing one for this provider.
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Key</>}
                            </button>
                        </form>
                    </div>

                    {/* Keys List */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5" /> Configured Keys
                        </h3>
                        <div className="space-y-3">
                            {keys.map(key => (
                                <div key={key._id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50">
                                    <div>
                                        <p className="font-medium text-sm capitalize">{key.provider}</p>
                                        <p className="text-xs text-muted-foreground font-mono">••••••••</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">Configured</span>
                                    </div>
                                </div>
                            ))}
                            {keys.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No API keys configured.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
