import dbConnect from '@/lib/mongodb/client'
import { SiteSettings, type ISidebarItem, type ISiteSettings } from '@/lib/mongodb/models'
import { SidebarManager } from './sidebar-manager'

// Default sidebar items
const DEFAULT_SIDEBAR_ITEMS = [
    { key: 'chat', label: 'Chat', href: '/chat', icon: 'MessageSquare', visible: true, order: 0 },
    { key: 'image', label: 'Image', href: '/image', icon: 'Image', visible: true, order: 1 },
    { key: 'video', label: 'Video', href: '/video', icon: 'Video', visible: true, order: 2 },
    { key: 'audio', label: 'Audio', href: '/audio', icon: 'Headphones', visible: true, order: 3 },
]

export default async function SidebarSettingsPage() {
    await dbConnect()

    let settings = await SiteSettings.findOne({ key: 'main' }).lean<ISiteSettings | null>()

    if (!settings) {
        const created = await SiteSettings.create({
            key: 'main',
            sidebarItems: DEFAULT_SIDEBAR_ITEMS
        })
        settings = created.toObject()
    }

    const items = JSON.parse(JSON.stringify(settings.sidebarItems)) as ISidebarItem[]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Sidebar Settings</h1>
                <p className="text-muted-foreground">Control which items appear in the home sidebar for users</p>
            </div>

            <SidebarManager initialItems={items} />
        </div>
    )
}
