'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
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
    const { data: session, status } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [expandedSections, setExpandedSections] = useState<string[]>(['content', 'management'])
    const router = useRouter()
    const pathname = usePathname()

    const isLoginPage = pathname === '/admin/login'
    const user = session?.user
    const isAdmin = user?.isAdmin ?? false
    const loading = status === 'loading'

    useEffect(() => {
        // Skip auth check for login page
        if (isLoginPage) {
            return
        }

        if (status === 'unauthenticated') {
            router.push('/admin/login')
        }
    }, [status, router, isLoginPage])

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/admin/login' })
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
                        You don&apos;t have admin privileges to access this page.
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
                            <p className="text-sm font-bold text-white tracking-wide">AINepal</p>
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
                                {user.name || user.email?.split('@')[0]}
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
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 lg:p-8 bg-black">
                    {children}
                </main>
            </div>
        </div>
    )
}
