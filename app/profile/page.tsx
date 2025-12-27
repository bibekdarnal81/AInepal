'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Save, Key, User, Mail, Phone, FileText, AlertCircle, ShoppingBag, LogOut } from 'lucide-react'
import Link from 'next/link'
import { AvatarUpload } from '@/components/avatar-upload'

interface Profile {
    display_name: string
    phone: string
    bio: string
    avatar_url: string
}

interface HostingOrder {
    id: string
    status: string
    price: number
    billing_cycle: string
    next_billing_date: string | null
    created_at: string
    hosting_plans: {
        name: string
        slug: string
    }
}

interface GenericOrder {
    id: string
    item_title: string
    item_type: string
    amount: number
    status: string
    created_at: string
}



function ProfilePageContent() {
    const [profile, setProfile] = useState<Profile>({
        display_name: '',
        phone: '',
        bio: '',
        avatar_url: ''
    })
    const [email, setEmail] = useState('')
    const [userId, setUserId] = useState('')
    const [orders, setOrders] = useState<HostingOrder[]>([])
    const [genericOrders, setGenericOrders] = useState<GenericOrder[]>([])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        checkAuth()
        // Set active tab from URL query parameter if present
        const tab = searchParams?.get('tab')
        if (tab && (tab === 'profile' || tab === 'orders' || tab === 'security')) {
            setActiveTab(tab as 'profile' | 'orders' | 'security')
        }
        if (searchParams?.get('new_order') === 'true') {
            setMessage({ type: 'success', text: 'Order placed successfully!' })
            // Clean URL
            router.replace('/profile?tab=orders')
        }
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/admin/login')
            return
        }
        setEmail(user.email || '')
        setUserId(user.id)
        fetchProfile(user.id)
        fetchOrders(user.id)
    }

    const fetchProfile = async (userId: string) => {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileData) {
            setProfile({
                display_name: profileData.display_name || '',
                phone: profileData.phone || '',
                bio: profileData.bio || '',
                avatar_url: profileData.avatar_url || ''
            })
        }
        setLoading(false)
    }

    const fetchOrders = async (userId: string) => {
        const { data: hostingData } = await supabase
            .from('hosting_orders')
            .select('*, hosting_plans(name, slug)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (hostingData) {
            setOrders(hostingData as any)
        }

        // Fetch all other order types
        const [
            { data: services },
            { data: projects },
            { data: domains }
        ] = await Promise.all([
            supabase.from('service_orders').select('*, services(title)').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('project_orders').select('*, projects(title)').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('domain_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
        ])

        const allGenericOrders: GenericOrder[] = [
            ...(services?.map(o => ({
                id: o.id,
                item_title: o.services?.title || 'Service',
                item_type: 'service',
                amount: o.amount,
                status: o.status,
                created_at: o.created_at
            })) || []),
            ...(projects?.map(o => ({
                id: o.id,
                item_title: o.projects?.title || 'Project',
                item_type: 'project',
                amount: o.amount,
                status: o.status,
                created_at: o.created_at
            })) || []),
            ...(domains?.map(o => ({
                id: o.id,
                item_title: o.domain_name,
                item_type: 'domain',
                amount: o.amount,
                status: o.status,
                created_at: o.created_at
            })) || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setGenericOrders(allGenericOrders)
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
            setMessage({ type: 'error', text: 'Passwords do not match' })
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
            setNewPassword('')
            setConfirmPassword('')
        }

        setSaving(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-foreground">
                        NextNepal
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings and view your orders</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                        : 'bg-red-500/10 border border-red-500/20 text-red-500'
                        }`}>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-xl border border-border p-4 space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                            >
                                <User className="h-5 w-5" />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                My Orders
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'security'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                            >
                                <Key className="h-5 w-5" />
                                Security
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'profile' && (
                            <div className="bg-card rounded-xl border border-border">
                                <div className="px-6 py-4 border-b border-border">
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
                                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                                                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

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
                                        Save Changes
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-card rounded-xl border border-border">
                                <div className="px-6 py-4 border-b border-border">
                                    <h2 className="text-lg font-semibold text-foreground">Order History</h2>
                                </div>
                                <div className="p-6">
                                    {orders.length === 0 && genericOrders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No orders yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Generic Orders (Bundles, etc) */}
                                            {genericOrders.map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-foreground">{order.item_title}</p>
                                                            <span className="text-xs uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">{order.item_type}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-foreground">
                                                            Rs. {order.amount.toLocaleString('en-NP')}
                                                        </p>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                'bg-gray-500/10 text-gray-500'}
                                                         `}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Hosting Orders */}
                                            {orders.map((order) => (
                                                <div key={order.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-foreground">{order.hosting_plans?.name || 'Unknown Plan'}</p>
                                                            <span className="text-xs uppercase bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">Hosting</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-foreground">
                                                            Rs. {order.price.toLocaleString('en-NP')}
                                                        </p>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                order.status === 'suspended' ? 'bg-red-500/10 text-red-500' :
                                                                    'bg-gray-500/10 text-gray-500'}
                                                         `}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-card rounded-xl border border-border">
                                <div className="px-6 py-4 border-b border-border">
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
                                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving || !newPassword}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <Key className="h-4 w-4" />
                                        )}
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <ProfilePageContent />
        </Suspense>
    )
}

