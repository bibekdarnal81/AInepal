'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Eye, Clock, CheckCircle, Users, UserCircle, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
                setRegisteredUsers(users)
            }

            // Get total registered users count
            const { count: usersCount, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            if (countError) {
                console.error('Error counting registered users:', countError)
            } else if (usersCount !== null) {
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
                setGuestUsers(guests)
            }

            // Get total guest users count
            const { count: guestsCount, error: guestsCountError } = await supabase
                .from('guest_chat_sessions')
                .select('*', { count: 'exact', head: true })

            if (guestsCountError) {
                console.error('Error counting guest users:', guestsCountError)
            } else if (guestsCount !== null) {
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
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/20'
        },
        {
            title: 'Published',
            value: stats.publishedPosts,
            icon: CheckCircle,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            border: 'border-green-400/20'
        },
        {
            title: 'Drafts',
            value: stats.draftPosts,
            icon: Clock,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
            border: 'border-orange-400/20'
        },
        {
            title: 'Registered Users',
            value: totalUsers,
            icon: UserCircle,
            color: 'text-violet-400',
            bg: 'bg-violet-400/10',
            border: 'border-violet-400/20'
        },
        {
            title: 'Guest Users',
            value: totalGuests,
            icon: Users,
            color: 'text-pink-400',
            bg: 'bg-pink-400/10',
            border: 'border-pink-400/20'
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin-reverse"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-zinc-400 mt-1 flex items-center gap-2">
                        Overview of your platform's performance
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-xs font-medium text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    System Online
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={stat.title}
                        className={`bg-zinc-900/50 backdrop-blur-sm rounded-2xl border ${stat.border} p-5 hover:bg-zinc-900 transition-colors group`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Metric</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                            <p className="text-xs font-medium text-zinc-400">{stat.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Posts - Takes up 2 columns */}
                <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <FileText className="h-4 w-4 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Recent Posts</h2>
                        </div>
                        <Link
                            href="/admin/posts"
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group"
                        >
                            View all
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="flex-1 divide-y divide-white/5">
                        {recentPosts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                                    <FileText className="h-6 w-6 text-zinc-600" />
                                </div>
                                <p className="text-zinc-400 font-medium">No posts created yet</p>
                                <Link
                                    href="/admin/posts/new"
                                    className="mt-4 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                                >
                                    Create First Post
                                </Link>
                            </div>
                        ) : (
                            recentPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/admin/posts/${post.id}`}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="min-w-0 pr-4">
                                        <h3 className="font-medium text-zinc-200 group-hover:text-white truncate transition-colors">{post.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-zinc-500">
                                                {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${post.published
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                        }`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* User Lists - Takes up 1 column */}
                <div className="space-y-6">
                    {/* Registered Users Short List */}
                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-violet-500/10">
                                    <UserCircle className="h-4 w-4 text-violet-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">New Users</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {registeredUsers.length === 0 ? (
                                <div className="px-6 py-8 text-center">
                                    <p className="text-zinc-500 text-sm">No users yet</p>
                                </div>
                            ) : (
                                registeredUsers.slice(0, 4).map((user) => (
                                    <div key={user.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 ring-2 ring-black">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-zinc-200 truncate">{user.display_name}</p>
                                            <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                                        </div>
                                        <span className="text-[10px] text-zinc-600 font-mono">
                                            {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Guest Users Short List */}
                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
                        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-pink-500/10">
                                    <Users className="h-4 w-4 text-pink-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Recent Guests</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {guestUsers.length === 0 ? (
                                <div className="px-6 py-8 text-center">
                                    <p className="text-zinc-500 text-sm">No guests yet</p>
                                </div>
                            ) : (
                                guestUsers.slice(0, 4).map((guest) => (
                                    <div key={guest.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/5 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 ring-2 ring-black">
                                            <Users className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-zinc-200 truncate">{guest.guest_name}</p>
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">GUEST</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 truncate">{guest.guest_email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
