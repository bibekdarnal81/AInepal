'use client'

import React from 'react'
import { SidebarProvider, AdminSidebar, useSidebar } from '@/components/admin/sidebar/admin-sidebar'
import { Menu } from 'lucide-react'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed, toggleSidebar, toggleMobileSidebar } = useSidebar()

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminSidebar />

            <div
                className={`transition-all duration-300 min-h-screen flex flex-col ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                    }`}
            >
                {/* Mobile Header Trigger */}
                <div className="lg:hidden h-16 border-b border-border bg-card flex items-center px-4 sticky top-0 z-30">
                    <button onClick={toggleMobileSidebar} className="p-2 -ml-2">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold ml-2">AINepal Admin</span>
                </div>

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminLayoutContent>
                {children}
            </AdminLayoutContent>
        </SidebarProvider>
    )
}
