"use client"

import { usePathname } from "next/navigation"
import { ChatSidebar } from "./chat-sidebar"

interface AIModel {
    _id: string
    displayName: string
    provider: string
    modelId: string
}

export function ConditionalChatSidebar({ models }: { models: AIModel[] }) {
    const pathname = usePathname()

    // Hide ChatSidebar on image, video, audio pages
    const hiddenPaths = ['/chat/image', '/chat/video', '/chat/audio']
    const shouldHide = hiddenPaths.some(path => pathname.startsWith(path))

    if (shouldHide) {
        return null
    }

    return <ChatSidebar models={models} />
}
