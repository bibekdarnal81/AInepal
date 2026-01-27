'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Key, User, Mail, Phone, FileText, AlertCircle } from 'lucide-react'
import { AvatarUpload } from '@/components/avatar-upload'

interface Profile {
    display_name: string
    phone: string
    bio: string
    avatar_url: string
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile>({
        display_name: '',
        phone: '',
        bio: '',
        avatar_url: ''
    })
    const [email, setEmail] = useState('')
    const [userId, setUserId] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setEmail(user.email || '')
            setUserId(user.id)

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setProfile({
                    display_name: profileData.display_name || '',
                    phone: profileData.phone || '',
                    bio: profileData.bio || '',
                    avatar_url: profileData.avatar_url || ''
                })
            }
        }
        setLoading(false)
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setSaving(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({
                display_name: profile.display_name,
                phone: profile.phone,
                bio: profile.bio,
                avatar_url: profile.avatar_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully' })
        }

        setSaving(false)
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
            return
        }

        setSaving(true)

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Password updated successfully' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{message.text}</p>
                </div>
            )}

            {/* Profile Information */}
            <div className="bg-card rounded-xl border border-border">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                </div>
                <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                    {/* Avatar Upload */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                            Profile Picture
                        </label>
                        {userId && (
                            <AvatarUpload
                                currentAvatarUrl={profile.avatar_url}
                                onUploadComplete={async (url) => {
                                    // Update local state
                                    setProfile({ ...profile, avatar_url: url })

                                    // Auto-save to database
                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({
                                            avatar_url: url,
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('id', userId)

                                    if (error) {
                                        setMessage({ type: 'error', text: 'Failed to save avatar' })
                                    } else {
                                        setMessage({ type: 'success', text: 'Avatar updated successfully' })
                                    }
                                }}
                                userId={userId}
                            />
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={profile.display_name}
                                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Bio
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                rows={4}
                                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-card rounded-xl border border-border">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving || !newPassword}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
