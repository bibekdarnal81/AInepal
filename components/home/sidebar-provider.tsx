"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SidebarContextType {
    isOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    // Handle responsiveness
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            // Auto close on mobile, auto open on desktop
            if (mobile) {
                setIsOpen(false)
            } else {
                setIsOpen(true)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const toggleSidebar = () => {
        setIsOpen(prev => !prev)
    }

    const setSidebarOpen = (open: boolean) => {
        setIsOpen(open)
    }

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar, setSidebarOpen, isMobile }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}
