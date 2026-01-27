"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Image, Video, Headphones, Plus, Search, PanelLeftClose, ChevronRight, LucideIcon, Loader2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useSidebar } from "./sidebar-provider"

interface ChatSession {
    id: string
    title: string
    updatedAt: string
}

// Icon map for dynamic rendering
const iconMap: Record<string, LucideIcon> = {
    MessageSquare,
    Image,
    Video,
    Headphones,
}

interface SidebarItem {
    key: string
    label: string
    href: string
    icon: string
    visible: boolean
    order: number
}

interface AppSidebarProps {
    sidebarItems?: SidebarItem[]
    user?: {
        name?: string | null
        image?: string | null
        email?: string | null
    }
}

export function AppSidebar({ sidebarItems = [], user }: AppSidebarProps) {
    const pathname = usePathname()
    const [planName, setPlanName] = useState("Free Plan")
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const { isOpen, toggleSidebar, isMobile } = useSidebar()

    useEffect(() => {
        const fetchMembership = async () => {
            if (user) {
                try {
                    const res = await fetch('/api/user/membership')
                    if (res.ok) {
                        const data = await res.json()
                        setPlanName(data.planName || "Free Plan")
                    }
                } catch (error) {
                    console.error("Failed to fetch membership:", error)
                }
            }
        }
        fetchMembership()
    }, [user])

    // Fetch chat history
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (user) {
                setLoadingHistory(true)
                try {
                    const res = await fetch('/api/user/chat-sessions?limit=10')
                    if (res.ok) {
                        const data = await res.json()
                        setChatHistory(data.sessions || [])
                    }
                } catch (error) {
                    console.error("Failed to fetch chat history:", error)
                }
                setLoadingHistory(false)
            }
        }
        fetchChatHistory()
    }, [user])

    const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const res = await fetch(`/api/user/chat-sessions?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                setChatHistory(prev => prev.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error("Failed to delete chat:", error)
        }
    }

    // Use dynamic sidebar items from DB, fallback to defaults
    const navItems = sidebarItems.length > 0
        ? sidebarItems.map(item => ({
            name: item.label,
            icon: iconMap[item.icon] || MessageSquare,
            href: item.href
        }))
        : [
            { name: "Chat", icon: MessageSquare, href: "/chat" },
            { name: "Image", icon: Image, href: "/image" },
            { name: "Video", icon: Video, href: "/video" },
            { name: "Audio", icon: Headphones, href: "/audio" },
        ]

    return (
        <aside
            className={`${isOpen ? 'translate-x-0 w-[260px] shadow-2xl md:shadow-none' : isMobile ? '-translate-x-full w-[260px]' : 'w-[72px] translate-x-0'} h-screen bg-white dark:bg-zinc-950 md:bg-gray-50/50 border-r border-gray-200 dark:border-zinc-800 flex flex-col flex-shrink-0 z-50 transition-all duration-300 font-sans overflow-hidden fixed md:static top-0 left-0`}
        >
            {/* Header */}
            <div className={`h-16 px-5 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} shrink-0`}>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white overflow-hidden">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 border-2 border-white dark:border-black rounded-full" />
                    </div>
                    <span className={`font-bold text-xl tracking-tight transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                        AInepal
                    </span>
                </div>
                {isOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors md:hidden"
                        title="Collapse sidebar"
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* New Chat Button Row */}
            <div className={`px-4 mb-2 shrink-0 ${!isOpen && 'px-2'}`}>
                <div className="flex gap-2">
                    <Link
                        href="/chat"
                        className={`flex-1 bg-[#dcfce7] hover:bg-[#bbf7d0] dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-green-200 dark:border-green-800/50 ${!isOpen ? 'px-0 w-full' : 'px-4'}`}
                        title="New Chat"
                    >
                        <MessageSquare className="w-5 h-5" />
                        {isOpen && <span className="text-sm">New Chat</span>}
                    </Link>
                    {isOpen && (
                        <button className="bg-[#dcfce7] hover:bg-[#bbf7d0] dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 p-2.5 rounded-lg border border-green-200 dark:border-green-800/50 transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 flex flex-col px-3 overflow-y-auto custom-scrollbar overflow-x-hidden">
                <nav className="space-y-1 mb-6 mt-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-[#dcfce7] text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    } ${!isOpen ? 'justify-center px-0' : ''}`}
                                title={!isOpen ? item.name : undefined}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-green-600 dark:text-green-400" : ""}`} />
                                {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* New Project */}
                <div className={`mb-6 px-1 ${!isOpen ? 'flex justify-center' : ''}`}>
                    <button className={`flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors ${!isOpen ? 'justify-center w-full' : ''}`}>
                        <Plus className="w-5 h-5 shrink-0" />
                        {isOpen && <span>New project</span>}
                    </button>
                </div>

                {/* Chat History */}
                {isOpen && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <span>Chat History</span>
                            <Search className="w-3.5 h-3.5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            {loadingHistory ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                </div>
                            ) : chatHistory.length === 0 ? (
                                <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No chat history</p>
                            ) : (
                                chatHistory.map((chat) => (
                                    <Link
                                        key={chat.id}
                                        href={`/chat/chat/${chat.id}`}
                                        className="group flex items-center justify-between w-full text-left px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                                    >
                                        <span className="truncate flex-1">{chat.title}</span>
                                        <button
                                            onClick={(e) => handleDeleteChat(chat.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                                        >
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                        </button>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Explore Section (Bottom) */}
            <div className={`px-4 py-3 border-t border-gray-100 dark:border-zinc-900 shrink-0 ${!isOpen ? 'flex justify-center' : ''}`}>
                <button className={`flex items-center w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white group ${isOpen ? 'justify-between' : 'justify-center'}`}>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold uppercase tracking-wider text-gray-400 ${!isOpen ? 'hidden' : ''}`}>Explore</span>
                        {!isOpen && <Search className="w-5 h-5" />}
                    </div>
                    {isOpen && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
            </div>

            {/* User Profile */}
            <div className={`p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shrink-0 ${!isOpen && 'p-2'}`}>
                <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                        {user?.image ? (
                            <img src={user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user?.name?.[0] || "R"
                        )}
                    </div>
                    {isOpen && (
                        <>
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {user?.name || "Rusha"}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">{planName}</p>
                            </div>
                            <button className="px-2 py-1 bg-gray-100/50 hover:bg-gray-200/50 dark:bg-zinc-800 dark:hover:bg-zinc-700/50 text-[10px] font-semibold text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-zinc-700 transition-colors">
                                Upgrade
                            </button>
                        </>
                    )}
                </div>
            </div>
        </aside>
    )
}
