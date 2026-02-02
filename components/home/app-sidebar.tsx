"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { MessageSquare, Image as ImageIcon, Video, Headphones, Plus, Search, PanelLeftClose, ChevronRight, ChevronDown, LucideIcon, Loader2, Code, Folder, MoreVertical, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useSidebar } from "./sidebar-provider"

interface ChatSession {
    id: string
    title: string
    updatedAt: string
    projectId?: string
}

interface ChatProject {
    id: string
    name: string
}

// Icon map for dynamic rendering
const iconMap: Record<string, LucideIcon> = {
    MessageSquare,
    Image: ImageIcon,
    Video,
    Headphones,
    Code,
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
    const [chatProjects, setChatProjects] = useState<ChatProject[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [isCreatingProject, setIsCreatingProject] = useState(false)
    const [newProjectName, setNewProjectName] = useState("")
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
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

    // Fetch chat history and projects
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoadingHistory(true)
                try {
                    const [sessionsRes, projectsRes] = await Promise.all([
                        fetch('/api/user/chat-sessions?limit=50'),
                        fetch('/api/user/chat-projects')
                    ])

                    if (sessionsRes.ok) {
                        const data = await sessionsRes.json()
                        setChatHistory(data.sessions || [])
                    }

                    if (projectsRes.ok) {
                        const data = await projectsRes.json()
                        setChatProjects(data.projects || [])
                    }
                } catch (error) {
                    console.error("Failed to fetch sidebar data:", error)
                }
                setLoadingHistory(false)
            }
        }
        fetchData()
    }, [user])

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return
        try {
            const res = await fetch('/api/user/chat-projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProjectName })
            })
            if (res.ok) {
                const project = await res.json()
                setChatProjects(prev => [project, ...prev])
                setNewProjectName("")
                setIsCreatingProject(false)
            }
        } catch (error) {
            console.error("Failed to create project:", error)
        }
    }

    const toggleProject = (id: string) => {
        setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleMoveToProject = async (chatId: string, projectId: string | null) => {
        try {
            const res = await fetch('/api/user/chat-sessions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: chatId, projectId })
            })
            if (res.ok) {
                setChatHistory(prev => prev.map(c => c.id === chatId ? { ...c, projectId: projectId || undefined } : c))
            }
        } catch (error) {
            console.error("Failed to move chat:", error)
        }
    }

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
        ? sidebarItems
            .filter(item => item.visible !== false) // Filter out hidden items
            .map(item => ({
                name: item.label,
                icon: iconMap[item.icon] || MessageSquare,
                href: item.href
            }))
        : [
            { name: "Chat", icon: MessageSquare, href: "/chat" },
            { name: "Image", icon: ImageIcon, href: "/image" },
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
                <div className={`mb-4 px-1 ${!isOpen ? 'flex justify-center' : ''}`}>
                    {isCreatingProject ? (
                        <div className="px-2 space-y-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Project name..."
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                onBlur={() => !newProjectName && setIsCreatingProject(false)}
                                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none focus:border-green-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateProject}
                                    className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsCreatingProject(false)}
                                    className="text-[10px] bg-gray-200 dark:bg-zinc-800 px-2 py-0.5 rounded hover:bg-gray-300 dark:hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreatingProject(true)}
                            className={`flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors ${!isOpen ? 'justify-center w-full' : ''}`}
                        >
                            <Plus className="w-5 h-5 shrink-0" />
                            {isOpen && <span>New project</span>}
                        </button>
                    )}
                </div>

                {/* Chat History / Projects */}
                {isOpen && (
                    <div className="mb-6 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <span>Chat History</span>
                            <Search className="w-3.5 h-3.5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                            {loadingHistory && chatHistory.length === 0 ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                </div>
                            ) : (
                                <>
                                    {/* Project Folders */}
                                    {chatProjects.map((project) => (
                                        <div key={project.id} className="space-y-0.5">
                                            <button
                                                onClick={() => toggleProject(project.id)}
                                                className="group flex items-center justify-between w-full text-left px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors font-medium"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    {expandedProjects[project.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                    <Folder className="w-4 h-4 text-green-600 dark:text-green-500" />
                                                    <span className="truncate">{project.name}</span>
                                                </div>
                                            </button>

                                            {expandedProjects[project.id] && (
                                                <div className="ml-6 border-l border-gray-100 dark:border-zinc-800 pl-1 space-y-0.5">
                                                    {chatHistory.filter(c => c.projectId === project.id).length === 0 ? (
                                                        <p className="px-3 py-1 text-[11px] text-gray-400 italic">No chats here</p>
                                                    ) : (
                                                        chatHistory.filter(c => c.projectId === project.id).map((chat) => (
                                                            <ChatLink key={chat.id} chat={chat} onDelete={handleDeleteChat} projects={chatProjects} onMove={handleMoveToProject} />
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Unassigned Chats */}
                                    {chatHistory.filter(c => !c.projectId).length > 0 && (
                                        <div className="pt-2">
                                            {chatProjects.length > 0 && (
                                                <div className="px-3 mb-1 text-[10px] font-bold text-gray-400/60 uppercase">Other Chats</div>
                                            )}
                                            {chatHistory.filter(c => !c.projectId).map((chat) => (
                                                <ChatLink key={chat.id} chat={chat} onDelete={handleDeleteChat} projects={chatProjects} onMove={handleMoveToProject} />
                                            ))}
                                        </div>
                                    )}

                                    {chatHistory.length === 0 && !loadingHistory && (
                                        <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No chat history</p>
                                    )}
                                </>
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
                            <Image src={user.image} alt="User" width={36} height={36} className="w-full h-full rounded-full object-cover" unoptimized />
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
                            <Link
                                href="/membership/upgrade"
                                className="px-2 py-1 bg-gray-100/50 hover:bg-gray-200/50 dark:bg-zinc-800 dark:hover:bg-zinc-700/50 text-[10px] font-semibold text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-zinc-700 transition-colors"
                            >
                                Upgrade
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </aside>
    )
}

function ChatLink({
    chat,
    onDelete,
    projects,
    onMove
}: {
    chat: ChatSession;
    onDelete: (id: string, e: React.MouseEvent) => void;
    projects: ChatProject[];
    onMove: (chatId: string, projectId: string | null) => void;
}) {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="group relative">
            <Link
                href={`/chat/chat/${chat.id}`}
                className="flex items-center justify-between w-full text-left px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
                <span className="truncate flex-1">{chat.title}</span>
            </Link>

            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowMenu(!showMenu)
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded"
                        title="Options"
                    >
                        <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 py-1">
                                <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Move to project</p>
                                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                    {projects.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                onMove(chat.id, p.id)
                                                setShowMenu(false)
                                            }}
                                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 ${chat.projectId === p.id ? 'text-green-600 font-semibold' : ''}`}
                                        >
                                            <Folder className="w-3.5 h-3.5" />
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                                {chat.projectId && (
                                    <button
                                        onClick={() => {
                                            onMove(chat.id, null)
                                            setShowMenu(false)
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-red-500 border-t border-gray-100 dark:border-zinc-800 mt-1"
                                    >
                                        Remove from project
                                    </button>
                                )}
                                <div className="border-t border-gray-100 dark:border-zinc-800 mt-1 pt-1">
                                    <button
                                        onClick={(e) => {
                                            onDelete(chat.id, e)
                                            setShowMenu(false)
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Chat
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
