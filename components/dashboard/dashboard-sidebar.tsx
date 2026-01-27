"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Menu, X, Home, User, HelpCircle, Sparkles, Moon, Sun } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardSidebarProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
    membership?: {
        title: string
        status: string
    } | null
}

export function DashboardSidebar({ user, membership }: DashboardSidebarProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const links = [
        { name: "Home", href: "/", icon: Home },
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        // Admin only link - we'll check permission in the map or via conditional rendering

    ]

    return (
        <>
            {/* Mobile Header Trigger */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="font-bold text-xl text-primary flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm">D</span>
                    AINepal
                </Link>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-[260px] bg-card text-card-foreground border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="p-3 mb-2">
                        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform">
                                <img src="/logo.png" alt="D" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <span className="font-semibold text-sm">New Chat</span>
                            <Settings className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 text-[14px] rounded-lg transition-colors group ${isActive
                                        ? "bg-secondary text-foreground font-medium"
                                        : "text-muted-foreground hover:bg-secondary/50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-3 border-t border-border relative" ref={menuRef}>
                        {/* Popup Menu */}
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-3 border-b border-border">
                                    <p className="text-sm font-semibold text-foreground">{user.name || "User"}</p>
                                    <p className="text-xs text-muted-foreground">@{user.email?.split('@')[0]}</p>
                                </div>
                                <div className="p-1">
                                    <Link
                                        href="/membership/upgrade"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        Upgrade plan
                                    </Link>

                                    {/* Theme Toggler Item */}
                                    <div className="flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <Moon className="w-4 h-4 text-muted-foreground dark:hidden" />
                                            <Sun className="w-4 h-4 text-muted-foreground hidden dark:block" />
                                            <span>Theme</span>
                                        </div>
                                        <ThemeToggle />
                                    </div>

                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                        Settings
                                    </Link>
                                </div>
                                <div className="p-1 border-t border-border">
                                    <Link
                                        href="/help"
                                        className="flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                            Help
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4 text-muted-foreground" />
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}

                        <div
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group relative ${userMenuOpen ? 'bg-secondary/50' : ''}`}
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="w-8 h-8 rounded-sm bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold overflow-hidden">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user.name?.[0] || "U"}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-[14px] font-medium truncate text-foreground">{user.name || "User"}</p>
                                    {membership?.status === 'active' && (
                                        <span className="text-[10px] bg-amber-200 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                            {membership.title.split(' ')[0]}
                                        </span>
                                    )}
                                </div>
                                {membership?.status === 'active' && (
                                    <p className="text-[11px] text-muted-foreground truncate">{membership.title}</p>
                                )}
                            </div>

                            <div className="text-muted-foreground ml-auto">
                                <span className="sr-only">Open user menu</span>
                                <div className="flex gap-0.5">
                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
