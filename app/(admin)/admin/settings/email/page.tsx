'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function EmailSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        resendApiKey: '',
        fromName: 'AINepal',
        fromEmail: 'onboarding@resend.dev'
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings/email')
                const data = await res.json()
                if (res.ok) {
                    setSettings(data.email)
                }
            } catch (error) {
                console.error('Error fetching settings:', error)
                toast.error('Failed to load email settings')
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Email settings saved successfully')
            } else {
                toast.error(data.error || 'Failed to save settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Configure your Resend API key and sender details for transactional emails.
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Resend API Key</label>
                        <input
                            type="password"
                            value={settings.resendApiKey}
                            onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="re_123456789..."
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Enter your API key from <a href="https://resend.com/api-keys" target="_blank" className="text-primary hover:underline">Resend Dashboard</a>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Sender Name</label>
                            <input
                                type="text"
                                value={settings.fromName}
                                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="AINepal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Sender Email</label>
                            <input
                                type="text"
                                value={settings.fromEmail}
                                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="onboarding@resend.dev"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={saving} className="min-w-[120px]">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Verify Domain</p>
                    <p>To send emails from a custom domain (e.g., hello@ainepal.dev), verify your domain in Resend and update the Sender Email above.</p>
                </div>
            </div>
        </div>
    )
}
