'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Eye, Clock, CheckCircle } from 'lucide-react'
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

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalPosts: 0, publishedPosts: 0, draftPosts: 0 })
    const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
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
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    post.published 
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
        </div>
    )
}
