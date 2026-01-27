'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Briefcase,
    Image,
    Layers,
    Settings,
    ShoppingCart,
    CreditCard,
    MessageSquare,
    MessageCircle,
    BadgeCheck,
    Users,
    Server,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    Store,
    Bot,
    PanelLeft,
    School
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

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
    icon: React.ReactNode
    label: string
    href?: string
    subItems?: { label: string; href: string; icon?: React.ReactNode }[]
}

function SidebarItem({ icon, label, href, subItems }: SidebarItemProps) {
    const { isCollapsed } = useSidebar()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const isActive = href ? pathname === href : subItems?.some(item => pathname === item.href)

    useEffect(() => {
        if (isActive) setIsOpen(true)
    }, [isActive])

    if (subItems) {
        return (
            <div className="mb-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                        isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {icon}
                        {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
                    </div>
                    {!isCollapsed && (
                        isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                </button>
                {isOpen && !isCollapsed && (
                    <div className="ml-9 mt-1 space-y-1">
                        {subItems.map((item) => {
                            const isSubActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "block px-3 py-1.5 text-sm rounded-md transition-colors",
                                        isSubActive
                                            ? "text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
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
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1",
                isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
        >
            {icon}
            {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
        </Link>
    )
}

export function AdminSidebar() {
    const { isCollapsed, isMobileOpen, toggleMobileSidebar } = useSidebar()
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
                    "fixed top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
                    isCollapsed ? "w-16" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center px-4 border-b border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                            D
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-none">AINepal</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Dashboard</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="ml-auto lg:hidden"
                        onClick={toggleMobileSidebar}
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    {/* Overview */}
                    <div>
                        {!isCollapsed && (
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Overview
                            </h3>
                        )}
                        <SidebarItem
                            icon={<LayoutDashboard className="h-5 w-5" />}
                            label="Dashboard"
                            href="/admin"
                        />
                    </div>

                    {/* Content Management */}
                    <div>
                        {!isCollapsed && (
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Content Management
                            </h3>
                        )}
                        <SidebarItem
                            icon={<FileText className="h-5 w-5" />}
                            label="Posts"
                            href="/admin/posts"
                        />
                        <SidebarItem
                            icon={<FolderOpen className="h-5 w-5" />}
                            label="Post Categories"
                            href="/admin/post-categories"
                        />
                        <SidebarItem
                            icon={<Store className="h-5 w-5" />}
                            label="Projects"
                            href="/admin/projects"
                        />
                        <SidebarItem
                            icon={<Image className="h-5 w-5" />}
                            label="Portfolios"
                            href="/admin/portfolios"
                        />
                        <SidebarItem
                            icon={<FolderOpen className="h-5 w-5" />}
                            label="Media"
                            href="/admin/media"
                        />
                        <SidebarItem
                            icon={<Layers className="h-5 w-5" />}
                            label="Categories"
                            href="/admin/categories"
                        />
                        <SidebarItem
                            icon={<Briefcase className="h-5 w-5" />}
                            label="Services"
                            href="/admin/services"
                        />
                    </div>

                    {/* AI Management */}
                    {((session?.user as any)?.isAdmin || session?.user?.email === 'admin@example.com') && (
                        <div>
                            {!isCollapsed && (
                                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    AI Management
                                </h3>
                            )}
                            <SidebarItem
                                icon={<Bot className="h-5 w-5" />}
                                label="Ai admin manager"
                                href="/admin/ai-models"
                            />
                            <SidebarItem
                                icon={<PanelLeft className="h-5 w-5" />}
                                label="Sidebar Settings"
                                href="/admin/sidebar"
                            />
                        </div>
                    )}

                    {/* Academics */}
                    <div>
                        {!isCollapsed && (
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Academics
                            </h3>
                        )}
                        <SidebarItem
                            icon={<School className="h-5 w-5" />}
                            label="Classes"
                            href="/admin/classes"
                        />
                    </div>

                    {/* Business */}
                    <div>
                        {!isCollapsed && (
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Business
                            </h3>
                        )}
                        <SidebarItem
                            icon={<ShoppingCart className="h-5 w-5" />}
                            label="Orders"
                            href="/admin/orders"
                        />
                        <SidebarItem
                            icon={<CreditCard className="h-5 w-5" />}
                            label="Payment Methods"
                            href="/admin/payment-methods"
                        />
                        <SidebarItem
                            icon={<MessageSquare className="h-5 w-5" />}
                            label="Messages"
                            href="/admin/bookings"
                        />
                        <SidebarItem
                            icon={<MessageCircle className="h-5 w-5" />}
                            label="Chat"
                            href="/admin/chat"
                        />
                        <SidebarItem
                            icon={<BadgeCheck className="h-5 w-5" />}
                            label="Memberships"
                            href="/admin/memberships"
                        />
                        <SidebarItem
                            icon={<Users className="h-5 w-5" />}
                            label="Users"
                            href="/admin/users"
                        />
                    </div>
                    {/* Hosting & Domains */}
                    <div>
                        {!isCollapsed && (
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Hosting & Domains
                            </h3>
                        )}
                        <SidebarItem
                            icon={<Server className="h-5 w-5" />}
                            label="Hosting Plans"
                            href="/admin/hosting"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="User" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="font-medium text-sm">
                                        {session?.user?.name?.[0] || 'A'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="p-1 hover:bg-secondary rounded-md transition-colors"
                            >
                                <LogOut className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signOut()}
                            className="w-full flex justify-center p-2 hover:bg-secondary rounded-md transition-colors"
                        >
                            <LogOut className="h-5 w-5 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </aside>
        </>
    )
}

