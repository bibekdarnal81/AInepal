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
    FolderKanban,
    Briefcase,
    BriefcaseBusiness,
    GraduationCap,
    MessageSquare,
    ShoppingBag,
    Mail,
    Users,
    Tag,
    ChevronDown,
    ChevronRight,
    Globe,
    Network,
    Image as ImageIcon,
    LayoutTemplate,
    CreditCard,
    Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-8 shadow-xl max-w-md text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
                            <X className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-zinc-400 mb-6">
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
                { name: 'Portfolios', href: '/admin/portfolios', icon: ImageIcon },
                { name: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
                { name: 'Categories', href: '/admin/categories', icon: FolderKanban },
                { name: 'Services', href: '/admin/services', icon: Briefcase },
                { name: 'AI Tools', href: '/admin/ai-tool', icon: Sparkles },
                { name: 'Classes', href: '/admin/classes', icon: GraduationCap },
                { name: 'Careers', href: '/admin/careers', icon: BriefcaseBusiness },
            ]
        },
        {
            id: 'management',
            title: 'Business',
            items: [
                { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
                { name: 'Payment Methods', href: '/admin/payments', icon: CreditCard },
                { name: 'Messages', href: '/admin/messages', icon: Mail },
                { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
                { name: 'Users', href: '/admin/users', icon: Users },
            ]
        },
        {
            id: 'hosting',
            title: 'Hosting & Domains',
            items: [
                { name: 'Hosting Plans', href: '/admin/hosting', icon: Globe },

                { name: 'Bundle Offers', href: '/admin/bundle-offers', icon: Tag },
                { name: 'Domains', href: '/admin/domains', icon: Network },
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
        <div className="min-h-screen bg-black text-zinc-100 font-sans">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-zinc-950/90 backdrop-blur-xl border-r border-white/5
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 flex flex-col
            `}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-white/5 flex-shrink-0">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white tracking-wide">Dunzo</p>
                            <p className="text-[10px] text-zinc-500 font-medium">ADMIN DASHBOARD</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6 scrollbar-none">
                    {navigationSections.map((section) => (
                        <div key={section.id}>
                            {section.title && (
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="flex items-center justify-between w-full px-3 py-2 mb-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors group"
                                >
                                    {section.title}
                                    {expandedSections.includes(section.id) ? (
                                        <ChevronDown className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                                    )}
                                </button>
                            )}
                            <AnimatePresence initial={false}>
                                {expandedSections.includes(section.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-0.5 overflow-hidden"
                                    >
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href ||
                                                (item.href !== '/admin' && pathname.startsWith(item.href))
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${isActive
                                                        ? 'bg-blue-600/10 text-blue-400'
                                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    onClick={() => setSidebarOpen(false)}
                                                >
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                                    )}
                                                    <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                                                    <span className="truncate">{item.name}</span>
                                                </Link>
                                            )
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </nav>

                {/* Recent Chats Section */}
                {chatUsers.length > 0 && (
                    <div className="px-3 pb-3 border-t border-white/5 pt-4 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3 px-3">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Chats</h3>
                            <Link
                                href="/admin/chat"
                                className="text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="space-y-1">
                            {chatUsers.map((chatUser) => (
                                <Link
                                    key={chatUser.user_id || chatUser.guest_session_id}
                                    href="/admin/chat"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors group"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <div className="relative">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${chatUser.is_guest
                                            ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30'
                                            : 'bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30'
                                            }`}>
                                            <Users className={`h-3.5 w-3.5 ${chatUser.is_guest ? 'text-orange-400' : 'text-violet-400'}`} />
                                        </div>
                                        {chatUser.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-black"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                                                {chatUser.display_name}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 truncate">
                                            {chatUser.is_guest ? 'Guest Visitor' : 'Registered User'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* User Profile Footer */}
                <div className="p-3 border-t border-white/5 flex-shrink-0 bg-black/20">
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner">
                            <span className="text-xs font-bold text-white">
                                {user.email?.[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                                {user.email?.split('@')[0]}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 mt-1 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64 min-h-screen flex flex-col">
                {/* Top bar */}
                <header className="h-16 bg-black/50 backdrop-blur-md border-b border-white/5 flex items-center px-6 sticky top-0 z-30 justify-between lg:justify-end">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-zinc-400 hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    {/* Add any global actions like refresh or notifications here if needed later */}
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 lg:p-8 bg-black">
                    {children}
                </main>
            </div>
        </div>
    )
}
