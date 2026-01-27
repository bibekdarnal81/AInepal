"use client"

import React from "react"
import { AppSidebar } from "@/components/home/app-sidebar"
import { useSidebar } from "@/components/home/sidebar-provider"

interface HomeLayoutContentProps {
    sidebarItems: any[]
    user: any
    children: React.ReactNode
}

export function HomeLayoutContent({ sidebarItems, user, children }: HomeLayoutContentProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            <AppSidebar sidebarItems={sidebarItems} user={user} />
            <main className="flex-1 overflow-hidden relative flex flex-col h-screen">
                {children}
            </main>
        </div>
    )
}
