

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Briefcase,
    Image as ImageIcon,
    Layers,
    ShoppingCart,
    CreditCard,
    MessageSquare,
    MessageCircle,
    BadgeCheck,
    Users,
    Server,
    LogOut,
    X,
    ChevronDown,
    ChevronRight,
    Store,
    Bot,
    PanelLeft,
    School,
    Key,
    PanelLeftClose,
    PanelLeftOpen,
    Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

type SidebarContextType = {
    isCollapsed: boolean
    toggleSidebar: () => void
    isMobileOpen: boolean
    toggleMobileSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const toggleSidebar = () => setIsCollapsed(!isCollapsed)
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen)

    return (
        <SidebarContext.Provider
            value={{ isCollapsed, toggleSidebar, isMobileOpen, toggleMobileSidebar }}
        >
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}

interface SidebarItemProps {
    icon: React.ReactElement
    label: string
    href?: string
    subItems?: { label: string; href: string; icon?: React.ReactElement }[]
}

function SidebarItem({ icon, label, href, subItems }: SidebarItemProps) {
    const { isCollapsed } = useSidebar()
    const pathname = usePathname()
    const isActive = href ? pathname === href : subItems?.some(item => pathname === item.href)
    const [isOpen, setIsOpen] = useState(isActive)

    // Update isOpen when active state changes, but only if it becomes active
    useEffect(() => {
        if (isActive && !isOpen) {
            const t = setTimeout(() => setIsOpen(true), 0)
            return () => clearTimeout(t)
        }
    }, [isActive, isOpen])

    if (subItems) {
        return (
            <div className="mb-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                        isActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                            className: cn("h-4 w-4", isActive ? "text-indigo-500" : "group-hover:text-zinc-700 dark:group-hover:text-zinc-300")
                        })}
                        {!isCollapsed && <span className="text-sm">{label}</span>}
                    </div>
                    {!isCollapsed && (
                        isOpen
                            ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                            : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                </button>
                {isOpen && !isCollapsed && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                        {subItems.map((item) => {
                            const isSubActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "block px-3 py-2 text-sm rounded-md transition-colors",
                                        isSubActive
                                            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 font-medium"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Link
            href={href!}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 mb-1 group relative",
                isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
            title={isCollapsed ? label : undefined}
        >
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: cn("h-4 w-4 transition-colors", isActive ? "text-indigo-500" : "group-hover:text-zinc-700 dark:group-hover:text-zinc-300")
            })}
            {!isCollapsed && <span className="text-sm">{label}</span>}
        </Link>
    )
}

export function AdminSidebar() {
    const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobileSidebar } = useSidebar()
    const { data: session } = useSession()

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col shadow-sm",
                    isCollapsed ? "w-16" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800 justify-between">
                    <div className={cn("flex items-center gap-3 overflow-hidden transition-all", isCollapsed ? "w-8" : "w-auto")}>
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-indigo-500/30">
                            A
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col opacity-100 transition-opacity duration-200">
                                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">AINepal</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Admin</span>
                            </div>
                        )}
                    </div>
                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 transition-colors"
                    >
                        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </button>
                    {/* Mobile Close */}
                    <button
                        className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                        onClick={toggleMobileSidebar}
                    >
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                {/* Navigation (ScrollArea) */}
                <ScrollArea className="flex-1 py-4">
                    <div className="px-3 space-y-6">
                        {/* Overview */}
                        <div>
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Overview
                                </h3>
                            )}
                            <SidebarItem
                                icon={<LayoutDashboard />}
                                label="Dashboard"
                                href="/admin"
                            />
                        </div>

                        {/* Content Management */}
                        <div>
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Content
                                </h3>
                            )}
                            <SidebarItem
                                icon={<FileText />}
                                label="About Page"
                                href="/admin/about"
                            />
                            <SidebarItem
                                icon={<FileText />}
                                label="Posts"
                                href="/admin/posts"
                            />
                            <SidebarItem
                                icon={<FolderOpen />}
                                label="Post Categories"
                                href="/admin/post-categories"
                            />
                            <SidebarItem
                                icon={<Store />}
                                label="Projects"
                                href="/admin/projects"
                            />
                            <SidebarItem
                                icon={<ImageIcon />}
                                label="Portfolios"
                                href="/admin/portfolios"
                            />
                            <SidebarItem
                                icon={<FolderOpen />}
                                label="Media"
                                href="/admin/media"
                            />
                            <SidebarItem
                                icon={<Layers />}
                                label="Categories"
                                href="/admin/categories"
                            />
                            <SidebarItem
                                icon={<Briefcase />}
                                label="Services"
                                href="/admin/services"
                            />
                        </div>

                        {/* AI Management */}
                        {/* AI Management */}
                        {/* AI Management */}
                        {((session?.user as { isAdmin?: boolean })?.isAdmin) && (
                            <div>
                                {!isCollapsed && (
                                    <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                        AI Tools
                                    </h3>
                                )}
                                <SidebarItem
                                    icon={<Bot />}
                                    label="AI Models"
                                    href="/admin/ai-models"
                                />
                                <SidebarItem
                                    icon={<PanelLeft />}
                                    label="Sidebar Settings"
                                    href="/admin/sidebar"
                                />
                                <SidebarItem
                                    icon={<Mail />}
                                    label="Email Settings"
                                    href="/admin/settings/email"
                                />
                            </div>
                        )}

                        {/* Academics */}
                        <div>
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Academics
                                </h3>
                            )}
                            <SidebarItem
                                icon={<School />}
                                label="Classes"
                                href="/admin/classes"
                            />
                        </div>

                        {/* Business */}
                        <div>
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Business
                                </h3>
                            )}
                            <SidebarItem
                                icon={<ShoppingCart />}
                                label="Orders"
                                href="/admin/orders"
                            />
                            <SidebarItem
                                icon={<CreditCard />}
                                label="Payment Methods"
                                href="/admin/payment-methods"
                            />
                            <SidebarItem
                                icon={<MessageSquare />}
                                label="Messages"
                                href="/admin/bookings"
                            />
                            <SidebarItem
                                icon={<MessageCircle />}
                                label="Chat Sessions"
                                href="/admin/chat"
                            />
                            <SidebarItem
                                icon={<BadgeCheck />}
                                label="Memberships"
                                href="/admin/memberships"
                            />
                            <SidebarItem
                                icon={<Users />}
                                label="Users"
                                href="/admin/users"
                            />
                        </div>
                        {/* Hosting & Domains */}
                        <div>
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Hosting
                                </h3>
                            )}
                            <SidebarItem
                                icon={<Server />}
                                label="Hosting Plans"
                                href="/admin/hosting"
                            />
                        </div>

                        {/* Developers */}
                        <div>
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                    Developers
                                </h3>
                            )}
                            <SidebarItem
                                icon={<Key />}
                                label="API Keys"
                                href="/admin/api-keys"
                            />
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                {session?.user?.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User Avatar"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="font-semibold text-xs text-zinc-600 dark:text-zinc-400">
                                        {session?.user?.name?.[0] || 'A'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{session?.user?.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
                            </div>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 p-0"
                                onClick={() => signOut()}
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-full h-9 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 p-0"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </aside>
        </>
    )
}

