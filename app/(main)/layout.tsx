import { SidebarProvider } from "@/components/home/sidebar-provider"
import { HomeLayoutContent } from "../../components/chat/chat-layout-content"
import dbConnect from "@/lib/mongodb/client"
import { SiteSettings } from "@/lib/mongodb/models"
import type { ISidebarItem, ISiteSettings } from '@/lib/types/mongodb'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const dynamic = 'force-dynamic'

// Default sidebar items
const DEFAULT_SIDEBAR_ITEMS = [
    { key: 'chat', label: 'Chat', href: '/chat', icon: 'MessageSquare', visible: true, order: 0 },
    { key: 'image', label: 'Image', href: '/image', icon: 'Image', visible: true, order: 1 },
    { key: 'video', label: 'Video', href: '/video', icon: 'Video', visible: true, order: 2 },
    { key: 'audio', label: 'Audio', href: '/audio', icon: 'Headphones', visible: true, order: 3 },
    { key: 'code', label: 'Code', href: '/code', icon: 'Code', visible: true, order: 4 },
]

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
    await dbConnect()

    let settings = await SiteSettings.findOne({ key: 'main' }).lean<ISiteSettings | null>()

    if (!settings) {
        settings = { sidebarItems: DEFAULT_SIDEBAR_ITEMS } as ISiteSettings
    } else {
        // Ensure new items like 'code' exist in current settings
        const existingKeys = new Set(settings.sidebarItems.map((i: ISidebarItem) => i.key))
        DEFAULT_SIDEBAR_ITEMS.forEach(defaultItem => {
            if (!existingKeys.has(defaultItem.key)) {
                settings?.sidebarItems.push(defaultItem)
            }
        })
    }

    // Filter visible items and sort by order
    const visibleItems = settings.sidebarItems
        .filter((item: ISidebarItem) => item.visible)
        .sort((a: ISidebarItem, b: ISidebarItem) => a.order - b.order)

    const sidebarItems = JSON.parse(JSON.stringify(visibleItems))

    const session = await getServerSession(authOptions)

    return (
        <SidebarProvider>
            <HomeLayoutContent sidebarItems={sidebarItems} user={session?.user}>
                {children}
            </HomeLayoutContent>
        </SidebarProvider>
    )
}
