'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ModelSelector } from '@/components/workspace/model-selector'
import { ChatInterface } from '@/components/workspace/chat-interface'
import type { UserModelPreference } from '@/lib/types/ai-models'

export default function WorkspacePage() {
    const [user, setUser] = useState<any>(null)
    const [preferences, setPreferences] = useState<UserModelPreference[]>([])
    const [selectedModels, setSelectedModels] = useState<string[]>([])
    const [isMultiChat, setIsMultiChat] = useState(false)
    const [loading, setLoading] = useState(true)
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

        setUser(user)
        await fetchUserPreferences()
        setLoading(false)
    }

    const fetchUserPreferences = async () => {
        try {
            const response = await fetch('/api/user-models')
            if (response.ok) {
                const data = await response.json()
                setPreferences(data.preferences || [])

                // Auto-select first model for Super Fiesta mode
                if (data.preferences && data.preferences.length > 0) {
                    setSelectedModels([data.preferences[0].model_id])
                }
            } else if (response.status === 401) {
                router.push('/auth/login')
            } else {
                // Initialize preferences if none exist
                await initializePreferences()
            }
        } catch (error) {
            console.error('Error fetching preferences:', error)
        }
    }

    const initializePreferences = async () => {
        try {
            const response = await fetch('/api/user-models', { method: 'POST' })
            if (response.ok) {
                await fetchUserPreferences()
            }
        } catch (error) {
            console.error('Error initializing preferences:', error)
        }
    }

    const handlePreferencesUpdate = async (updatedPreferences: UserModelPreference[]) => {
        try {
            setPreferences(updatedPreferences)

            const response = await fetch('/api/user-models', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: updatedPreferences })
            })

            if (!response.ok) {
                console.error('Failed to update preferences')
            }
        } catch (error) {
            console.error('Error updating preferences:', error)
        }
    }

    const handleModelSelection = (modelIds: string[]) => {
        setSelectedModels(modelIds)
    }

    const toggleChatMode = () => {
        setIsMultiChat(!isMultiChat)
        if (!isMultiChat && selectedModels.length === 0 && preferences.length > 0) {
            // Switching to multi-chat, select first 3 models
            const firstThree = preferences.slice(0, 3).map(p => p.model_id)
            setSelectedModels(firstThree)
        } else if (isMultiChat && selectedModels.length > 1) {
            // Switching to Super Fiesta, keep only first selected model
            setSelectedModels([selectedModels[0]])
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading workspace...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gradient">AI Workspace</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage and interact with multiple AI models
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Mode Toggle */}
                            <button
                                onClick={toggleChatMode}
                                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${isMultiChat
                                        ? 'bg-gradient-to-r from-blue-600 via-emerald-600 to-cyan-600 text-white shadow-lg'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                    }`}
                            >
                                {isMultiChat ? '🎉 Multi-Chat' : '⚡ Super Fiesta'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Model Selector Sidebar */}
                    <div className="lg:col-span-1">
                        <ModelSelector
                            preferences={preferences}
                            selectedModels={selectedModels}
                            isMultiChat={isMultiChat}
                            onPreferencesUpdate={handlePreferencesUpdate}
                            onModelSelection={handleModelSelection}
                        />
                    </div>

                    {/* Chat Interface */}
                    <div className="lg:col-span-3">
                        <ChatInterface
                            preferences={preferences}
                            selectedModels={selectedModels}
                            isMultiChat={isMultiChat}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
