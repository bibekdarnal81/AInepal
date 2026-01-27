'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface AiModel {
    id: string
    provider: string
    model_name: string
    model_id: string
    display_name: string
    is_active: boolean
}

interface ApiKey {
    provider: string
    hasKey: boolean
}

export default function AiToolPage() {
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [models, setModels] = useState<AiModel[]>([])
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState<Record<string, boolean>>({})
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/auth/login')
            return
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) {
            router.push('/')
            return
        }

        setUser(user)
        setIsAdmin(true)
        await fetchModels()
        setLoading(false)
    }

    const fetchModels = async () => {
        const { data } = await supabase
            .from('ai_models')
            .select('*')
            .order('provider')
            .order('display_name')

        if (data) {
            setModels(data)
        }
    }

    const handleApiKeyChange = (provider: string, value: string) => {
        setApiKeys(prev => ({ ...prev, [provider]: value }))
    }

    const toggleShowKey = (provider: string) => {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
    }

    const handleSaveKey = async (provider: string) => {
        const apiKey = apiKeys[provider]
        if (!apiKey || !apiKey.trim()) return

        setSaving(true)
        try {
            const response = await fetch('/api/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    api_key: apiKey
                })
            })

            if (response.ok) {
                const data = await response.json()
                // Clear the input
                setApiKeys(prev => ({ ...prev, [provider]: '' }))
                alert(data.message || `API key for ${provider} saved successfully!`)
            } else {
                const error = await response.json()
                alert(`Failed to save API key: ${error.error}`)
            }
        } catch (error) {
            console.error('Error saving API key:', error)
            alert('Error saving API key')
        } finally {
            setSaving(false)
        }
    }

    const handleTestConnection = async (provider: string, modelId: string) => {
        setTesting(prev => ({ ...prev, [provider]: true }))
        setTestResults(prev => ({ ...prev, [provider]: { success: false, message: 'Testing...' } }))

        try {
            const response = await fetch(`/api/ai-models/test-connection?provider=${provider}&model_id=${modelId}`)
            const data = await response.json()

            setTestResults(prev => ({
                ...prev,
                [provider]: {
                    success: data.success,
                    message: data.message
                }
            }))
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [provider]: {
                    success: false,
                    message: 'Test failed'
                }
            }))
        } finally {
            setTesting(prev => ({ ...prev, [provider]: false }))
        }
    }

    const handleToggleActive = async (modelId: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/ai-models', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: modelId,
                    is_active: !currentStatus
                })
            })

            if (response.ok) {
                await fetchModels()
            }
        } catch (error) {
            console.error('Error toggling model status:', error)
        }
    }

    const groupedModels = models.reduce((acc, model) => {
        if (!acc[model.provider]) {
            acc[model.provider] = []
        }
        acc[model.provider].push(model)
        return acc
    }, {} as Record<string, AiModel[]>)

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">AI Models & API Keys</h1>
                    <p className="text-muted-foreground">
                        Configure API keys and manage AI model settings
                    </p>
                </div>

                <div className="space-y-6">
                    {Object.entries(groupedModels).map(([provider, providerModels]) => (
                        <div key={provider} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold capitalize">{provider}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {providerModels.length} model{providerModels.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* API Key Input */}
                            <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
                                <label className="block text-sm font-medium mb-2">
                                    API Key for {provider}
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type={showKeys[provider] ? 'text' : 'password'}
                                            value={apiKeys[provider] || ''}
                                            onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                                            placeholder={`Enter ${provider} API key`}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            onClick={() => toggleShowKey(provider)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showKeys[provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleSaveKey(provider)}
                                        disabled={!apiKeys[provider] || saving}
                                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                </div>
                                {testResults[provider] && (
                                    <div className={`mt-2 flex items-center gap-2 text-sm ${testResults[provider].success ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {testResults[provider].success ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                        <span>{testResults[provider].message}</span>
                                    </div>
                                )}
                            </div>

                            {/* Models List */}
                            <div className="space-y-3">
                                {providerModels.map(model => (
                                    <div key={model.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                        <div className="flex-1">
                                            <h3 className="font-medium">{model.display_name}</h3>
                                            <p className="text-sm text-muted-foreground">{model.model_name}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleTestConnection(provider, model.model_id)}
                                                disabled={testing[provider]}
                                                className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {testing[provider] ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <TestTube className="w-4 h-4" />
                                                )}
                                                Test
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(model.id, model.is_active)}
                                                className={`px-4 py-2 rounded-lg font-medium ${model.is_active
                                                    ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-600 hover:bg-gray-500/30'
                                                    }`}
                                            >
                                                {model.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        💡 <strong>Tip:</strong> After configuring API keys, visit the{' '}
                        <a href="/workspace" className="underline font-medium">AI Workspace</a> to start chatting with your models!
                    </p>
                </div>
            </div>
        </div>
    )
}
