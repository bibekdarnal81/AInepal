'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    BookOpen,
    FolderKanban,
    Briefcase,
    MessageSquare,
    ShoppingBag,
    Mail,
    Users,
    Tag,
    ChevronDown,
    ChevronRight
} from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [expandedSections, setExpandedSections] = useState<string[]>(['content', 'management'])
    const [chatUsers, setChatUsers] = useState<Array<{
        user_id: string | null
        guest_session_id: string | null
        display_name: string
        unread_count: number
        is_guest: boolean
        last_message_time: string
    }>>([])
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const isLoginPage = pathname === '/admin/login'

    useEffect(() => {
        // Skip auth check for login page
        if (isLoginPage) {
            return
        }

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/admin/login')
            } else {
                setUser(user)

                // Check if user is admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single()

                if (profile?.is_admin) {
                    setIsAdmin(true)
                } else {
                    console.error('User is not an admin')
                    setIsAdmin(false)
                }
            }
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' && !isLoginPage) {
                router.push('/admin/login')
            } else if (session?.user) {
                setUser(session.user)
            }
        })

        return () => subscription.unsubscribe()
    }, [router, supabase.auth, isLoginPage])

    useEffect(() => {
        if (isAdmin && !isLoginPage) {
            fetchChatUsers()

            // Subscribe to chat message changes
            const chatChannel = supabase
                .channel('admin_sidebar_chat')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages',
                }, () => {
                    fetchChatUsers()
                })
                .subscribe()

            return () => {
                supabase.removeChannel(chatChannel)
            }
        }
    }, [isAdmin, isLoginPage])

    const fetchChatUsers = async () => {
        try {
            // Get all chat messages
            const { data: messagesData } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })

            if (messagesData && messagesData.length > 0) {
                // Get unique user IDs and guest session IDs
                const userIds = [...new Set(messagesData.filter(m => m.user_id).map(m => m.user_id))]
                const guestSessionIds = [...new Set(messagesData.filter(m => m.guest_session_id).map(m => m.guest_session_id))]

                // Fetch registered user profiles
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, display_name')
                    .in('id', userIds)

                // Fetch guest sessions
                const { data: guestSessionsData } = await supabase
                    .from('guest_chat_sessions')
                    .select('id, guest_name')
                    .in('id', guestSessionIds)

                // Create maps
                const profileMap = new Map(profilesData?.map(p => [p.id, p]) || [])
                const guestMap = new Map(guestSessionsData?.map(g => [g.id, g]) || [])

                // Group by user_id or guest_session_id
                const userMap = new Map()

                messagesData.forEach((msg: any) => {
                    const key = msg.user_id || msg.guest_session_id
                    if (!key) return

                    if (!userMap.has(key)) {
                        const unreadCount = messagesData.filter(
                            (m: any) => ((m.user_id === msg.user_id && m.user_id) || (m.guest_session_id === msg.guest_session_id && m.guest_session_id)) && !m.is_read && !m.is_admin
                        ).length

                        if (msg.user_id) {
                            const profile = profileMap.get(msg.user_id)
                            userMap.set(key, {
                                user_id: msg.user_id,
                                guest_session_id: null,
                                display_name: profile?.display_name || 'Unknown User',
                                unread_count: unreadCount,
                                is_guest: false,
                                last_message_time: msg.created_at
                            })
                        } else if (msg.guest_session_id) {
                            const guestSession = guestMap.get(msg.guest_session_id)
                            userMap.set(key, {
                                user_id: null,
                                guest_session_id: msg.guest_session_id,
                                display_name: guestSession?.guest_name || 'Guest User',
                                unread_count: unreadCount,
                                is_guest: true,
                                last_message_time: msg.created_at
                            })
                        }
                    }
                })

                // Sort by unread count (highest first), then by last message time
                const sortedUsers = Array.from(userMap.values()).sort((a, b) => {
                    if (a.unread_count !== b.unread_count) {
                        return b.unread_count - a.unread_count
                    }
                    return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
                }).slice(0, 2) // Show only top 2

                setChatUsers(sortedUsers)
            } else {
                setChatUsers([])
            }
        } catch (err) {
            console.error('Error fetching chat users:', err)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        )
    }

    // For login page, just render children directly
    if (isLoginPage) {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl border border-border p-8 shadow-xl max-w-md text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">
                        You don't have admin privileges to access this page.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        )
    }

    const navigationSections = [
        {
            id: 'overview',
            title: 'Overview',
            items: [
                { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
            ]
        },
        {
            id: 'content',
            title: 'Content Management',
            items: [
                { name: 'Posts', href: '/admin/posts', icon: FileText },
                { name: 'Post Categories', href: '/admin/posts/categories', icon: Tag },
                { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
                { name: 'Categories', href: '/admin/categories', icon: FolderKanban },
                { name: 'Services', href: '/admin/services', icon: Briefcase },
            ]
        },
        {
            id: 'management',
            title: 'Business',
            items: [
                { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
                { name: 'Messages', href: '/admin/messages', icon: Mail },
                { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
                { name: 'Users', href: '/admin/users', icon: Users },
            ]
        },
        {
            id: 'system',
            title: 'System',
            items: [
                { name: 'Settings', href: '/admin/settings', icon: Settings },
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 flex flex-col
            `}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Rusha</p>
                            <p className="text-xs text-muted-foreground">Admin</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-6">
                    {navigationSections.map((section) => (
                        <div key={section.id}>
                            {section.title && (
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="flex items-center justify-between w-full px-2 py-1.5 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                                >
                                    {section.title}
                                    {expandedSections.includes(section.id) ? (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            )}
                            {expandedSections.includes(section.id) && (
                                <div className="space-y-0.5">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href ||
                                            (item.href !== '/admin' && pathname.startsWith(item.href))
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                                    }`}
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Recent Chats Section */}
                {chatUsers.length > 0 && (
                    <div className="px-3 pb-3 border-t border-border/50 pt-3 flex-shrink-0">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Chats</h3>
                            <Link
                                href="/admin/chat"
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="space-y-0.5">
                            {chatUsers.map((chatUser) => (
                                <Link
                                    key={chatUser.user_id || chatUser.guest_session_id}
                                    href="/admin/chat"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary/50 transition-colors"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${chatUser.is_guest
                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                        : 'bg-gradient-to-br from-violet-500 to-pink-500'
                                        }`}>
                                        <Users className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {chatUser.display_name}
                                            </p>
                                            {chatUser.is_guest && (
                                                <span className="px-1 py-0.5 text-[9px] bg-orange-500 text-white rounded-full">
                                                    G
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {chatUser.unread_count > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full font-medium">
                                            {chatUser.unread_count}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* User Profile Footer */}
                <div className="p-3 border-t border-border flex-shrink-0">
                    <div className="flex items-center gap-2 px-2 py-2 mb-1">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-white">
                                {user.email?.[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                                {user.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="h-16 bg-card border-b border-border flex items-center px-6 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1" />
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
