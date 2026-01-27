'use client'

import React, { useEffect, useState } from 'react'
import {
    FileText,
    CheckCircle2,
    Clock,
    Users,
    User,
    ArrowRight,
    Plus
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
    // Stats state
    const [stats, setStats] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        registeredUsers: 0,
        guestUsers: 0
    })

    // Data state
    const [recentUsers, setRecentUsers] = useState<Array<{
        id: string
        name?: string
        email?: string
        image?: string
        avatarColor?: string
        date: string
    }>>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                const data = await res.json()
                if (res.ok) {
                    setStats(data.stats)
                    setRecentUsers(data.recentUsers)
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of your platform&apos;s performance</p>
                </div>
                <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        System Online
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Posts"
                    value={stats.totalPosts}
                    icon={<FileText className="h-5 w-5 text-blue-500" />}
                    subtext="All content"
                />
                <StatCard
                    title="Published"
                    value={stats.publishedPosts}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                    subtext="Live on site"
                />
                <StatCard
                    title="Drafts"
                    value={stats.draftPosts}
                    icon={<Clock className="h-5 w-5 text-orange-500" />}
                    subtext="Work in progress"
                />
                <StatCard
                    title="Registered Users"
                    value={stats.registeredUsers}
                    icon={<Users className="h-5 w-5 text-purple-500" />}
                    subtext="Total accounts"
                />
                <StatCard
                    title="Guest Users"
                    value={stats.guestUsers}
                    icon={<User className="h-5 w-5 text-pink-500" />}
                    subtext="Unregistered"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Posts - Left/Center Column (Span 2) */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Recent Posts
                        </h2>
                        <Link href="/admin/posts" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                        <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No posts created yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Start creating content to see it appear here on your dashboard.
                        </p>
                        <Link
                            href="/admin/posts/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create First Post
                        </Link>
                    </div>
                </div>

                {/* Right Column - New Users & Recent Guests */}
                <div className="space-y-6">
                    {/* New Users */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                New Users
                            </h2>
                        </div>
                        <div className="divide-y divide-border">
                            {recentUsers.length > 0 ? (
                                recentUsers.map((user) => (
                                    <div key={user.id} className="p-4 flex items-center gap-3 hover:bg-secondary/20 transition-colors">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden ${user.avatarColor || 'bg-gray-500'}`}>
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user.name?.[0]?.toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{user.date}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No users found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Guests */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <User className="h-5 w-5 text-pink-500" />
                                Recent Guests
                            </h2>
                        </div>
                        <div className="p-12 text-center text-muted-foreground text-sm">
                            <p>No guests yet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, subtext }: { title: string, value: number, icon: React.ReactNode, subtext?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-secondary/50 rounded-lg">
                    {icon}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">METRIC</span>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
                <p className="text-sm font-medium text-foreground">{title}</p>
                {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
            </div>
        </motion.div>
    )
}
