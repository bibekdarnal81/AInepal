'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Eye, Clock, CheckCircle, Users, UserCircle } from 'lucide-react'
import Link from 'next/link'

interface Stats {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
}

interface RecentPost {
    id: string
    title: string
    slug: string
    published: boolean
    created_at: string
}

interface RegisteredUser {
    id: string
    display_name: string
    email: string
    avatar_url: string | null
    created_at: string
}

interface GuestUser {
    id: string
    guest_name: string
    guest_email: string
    guest_phone: string | null
    created_at: string
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalPosts: 0, publishedPosts: 0, draftPosts: 0 })
    const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
    const [guestUsers, setGuestUsers] = useState<GuestUser[]>([])
    const [totalUsers, setTotalUsers] = useState(0)
    const [totalGuests, setTotalGuests] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            // Fetch all posts for stats
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error && posts) {
                const published = posts.filter(p => p.published).length
                setStats({
                    totalPosts: posts.length,
                    publishedPosts: published,
                    draftPosts: posts.length - published
                })
                setRecentPosts(posts.slice(0, 5))
            }

            // Fetch registered users
            const { data: users, error: usersError } = await supabase
                .from('profiles')
                .select('id, display_name, email, avatar_url, created_at')
                .order('created_at', { ascending: false })
                .limit(5)

            if (usersError) {
                console.error('Error fetching registered users:', usersError)
            } else if (users) {
                console.log('Fetched registered users:', users.length)
                setRegisteredUsers(users)
            }

            // Get total registered users count
            const { count: usersCount, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            if (countError) {
                console.error('Error counting registered users:', countError)
            } else if (usersCount !== null) {
                console.log('Total registered users:', usersCount)
                setTotalUsers(usersCount)
            }

            // Fetch guest users
            const { data: guests, error: guestsError } = await supabase
                .from('guest_chat_sessions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            if (guestsError) {
                console.error('Error fetching guest users:', guestsError)
            } else if (guests) {
                console.log('Fetched guest users:', guests.length)
                setGuestUsers(guests)
            }

            // Get total guest users count
            const { count: guestsCount, error: guestsCountError } = await supabase
                .from('guest_chat_sessions')
                .select('*', { count: 'exact', head: true })

            if (guestsCountError) {
                console.error('Error counting guest users:', guestsCountError)
            } else if (guestsCount !== null) {
                console.log('Total guest users:', guestsCount)
                setTotalGuests(guestsCount)
            }

            setLoading(false)
        }
        fetchData()
    }, [supabase])

    const statCards = [
        {
            title: 'Total Posts',
            value: stats.totalPosts,
            icon: FileText,
            color: 'bg-blue-500/10 text-blue-500'
        },
        {
            title: 'Published',
            value: stats.publishedPosts,
            icon: CheckCircle,
            color: 'bg-green-500/10 text-green-500'
        },
        {
            title: 'Drafts',
            value: stats.draftPosts,
            icon: Clock,
            color: 'bg-yellow-500/10 text-yellow-500'
        },
        {
            title: 'Registered Users',
            value: totalUsers,
            icon: UserCircle,
            color: 'bg-violet-500/10 text-violet-500'
        },
        {
            title: 'Guest Users',
            value: totalGuests,
            icon: Users,
            color: 'bg-orange-500/10 text-orange-500'
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.title} className="bg-card rounded-xl border border-border p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Posts */}
            <div className="bg-card rounded-xl border border-border">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Recent Posts</h2>
                    <Link
                        href="/admin/posts"
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        View all
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {recentPosts.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No posts yet</p>
                            <Link
                                href="/admin/posts/new"
                                className="inline-block mt-4 text-primary hover:text-primary/80"
                            >
                                Create your first post
                            </Link>
                        </div>
                    ) : (
                        recentPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/${post.id}`}
                                className="flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors"
                            >
                                <div>
                                    <h3 className="font-medium text-foreground">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${post.published
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {post.published ? 'Published' : 'Draft'}
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* User Lists Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Registered Users List */}
                <div className="bg-card rounded-xl border border-border">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-violet-500" />
                            <h2 className="text-lg font-semibold text-foreground">Registered Users</h2>
                        </div>
                        <span className="text-sm text-muted-foreground">{totalUsers} total</span>
                    </div>
                    <div className="divide-y divide-border">
                        {registeredUsers.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No registered users yet</p>
                            </div>
                        ) : (
                            registeredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.display_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle className="h-6 w-6 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-foreground truncate">{user.display_name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-1 text-xs bg-violet-500/10 text-violet-500 rounded-full">
                                            Registered
                                        </span>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Guest Users List */}
                <div className="bg-card rounded-xl border border-border">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-500" />
                            <h2 className="text-lg font-semibold text-foreground">Guest Users</h2>
                        </div>
                        <span className="text-sm text-muted-foreground">{totalGuests} total</span>
                    </div>
                    <div className="divide-y divide-border">
                        {guestUsers.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No guest users yet</p>
                            </div>
                        ) : (
                            guestUsers.map((guest) => (
                                <div
                                    key={guest.id}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-foreground truncate">{guest.guest_name}</h3>
                                            <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                                                Guest
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">📧 {guest.guest_email}</p>
                                        {guest.guest_phone && (
                                            <p className="text-xs text-muted-foreground truncate">📱 {guest.guest_phone}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(guest.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
