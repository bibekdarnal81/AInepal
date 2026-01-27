'use client'

import { usePathname } from 'next/navigation'
import { ChatWidget } from '@/components/chat/chat-widget'

export function ConditionalChatWidget() {
    const pathname = usePathname()

    // Hide chat widget only on admin routes
    if (pathname?.startsWith('/admin')) {
        return null
    }

    return <ChatWidget />
}
