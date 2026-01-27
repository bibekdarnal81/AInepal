"use client"

import { useSidebar } from "./sidebar-provider"
import { AppSidebar } from "./app-sidebar"

interface SidebarItem {
    key: string
    label: string
    href: string
    icon: string
    visible: boolean
    order: number
}

interface HomeLayoutContentProps {
    children: React.ReactNode
    sidebarItems?: SidebarItem[]
    user?: {
        name?: string | null
        image?: string | null
        email?: string | null
    }
}

export function HomeLayoutContent({ children, sidebarItems = [], user }: HomeLayoutContentProps) {
    const { isOpen, isMobile, setSidebarOpen } = useSidebar()

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            <AppSidebar sidebarItems={sidebarItems} user={user} />

            {/* Mobile Backdrop */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-zinc-950">
                {children}
            </main>
        </div>
    )
}
