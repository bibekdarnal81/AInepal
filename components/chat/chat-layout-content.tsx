"use client"

import React from "react"
import { AppSidebar } from "@/components/home/app-sidebar"
import { useSidebar } from "@/components/home/sidebar-provider"

import type { ISidebarItem } from "@/lib/types/mongodb"

interface User {
    name?: string | null
    image?: string | null
    email?: string | null
}

interface HomeLayoutContentProps {
    sidebarItems: ISidebarItem[]
    user: User | null | undefined
    children: React.ReactNode
}

export function HomeLayoutContent({ sidebarItems, user, children }: HomeLayoutContentProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            <AppSidebar sidebarItems={sidebarItems} user={user || undefined} />
            <main className="flex-1 overflow-hidden relative flex flex-col h-screen">
                {children}
            </main>
        </div>
    )
}
