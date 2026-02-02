"use client"

import React, { createContext, useContext, useState } from "react"

interface CodeSidebarContextType {
    isOpen: boolean
    code: string
    language: string
    openSidebar: (code: string, language: string) => void
    closeSidebar: () => void
}

const CodeSidebarContext = createContext<CodeSidebarContextType | undefined>(undefined)

export function CodeSidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState("")

    const openSidebar = (newCode: string, newLanguage: string) => {
        setCode(newCode)
        setLanguage(newLanguage)
        setIsOpen(true)
    }

    const closeSidebar = () => {
        setIsOpen(false)
    }

    return (
        <CodeSidebarContext.Provider value={{ isOpen, code, language, openSidebar, closeSidebar }}>
            {children}
        </CodeSidebarContext.Provider>
    )
}

export function useCodeSidebar() {
    const context = useContext(CodeSidebarContext)
    if (context === undefined) {
        throw new Error("useCodeSidebar must be used within a CodeSidebarProvider")
    }
    return context
}
