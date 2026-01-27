import { dbConnect } from "../lib/mongodb/client"
import { SiteSettings } from "../lib/mongodb/models/SiteSettings"
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function fixSidebarLinks() {
    try {
        console.log("Connecting to MongoDB...")
        await dbConnect()
        console.log("Connected.")

        console.log("Updating SiteSettings...")
        const settings = await SiteSettings.findOne({ key: 'main' })

        if (!settings) {
            console.log("No settings found. Creating default...")
            await SiteSettings.create({
                key: 'main',
                sidebarItems: [
                    { key: 'chat', label: 'Chat', href: '/chat', icon: 'MessageSquare', visible: true, order: 0 },
                    { key: 'image', label: 'Image', href: '/image', icon: 'Image', visible: true, order: 1 },
                    { key: 'video', label: 'Video', href: '/video', icon: 'Video', visible: true, order: 2 },
                    { key: 'audio', label: 'Audio', href: '/audio', icon: 'Headphones', visible: true, order: 3 },
                ]
            })
        } else {
            console.log("Found existing settings. Updating items...")
            // Update items to use new hrefs
            const newItems = [
                { key: 'chat', label: 'Chat', href: '/chat', icon: 'MessageSquare', visible: true, order: 0 },
                { key: 'image', label: 'Image', href: '/image', icon: 'Image', visible: true, order: 1 },
                { key: 'video', label: 'Video', href: '/video', icon: 'Video', visible: true, order: 2 },
                { key: 'audio', label: 'Audio', href: '/audio', icon: 'Headphones', visible: true, order: 3 },
            ]

            // Merge with existing visibility/order if possible, or just overwrite for safety on paths
            // Let's just overwrite the core items to ensure paths are fixed, but try to preserve order/visibility if keys match?
            // User probably wants them fixed. Overwriting is safer for fixing broken paths.

            settings.sidebarItems = newItems
            await settings.save()
        }

        console.log("Sidebar links updated successfully.")
        process.exit(0)
    } catch (error) {
        console.error("Error updating sidebar links:", error)
        process.exit(1)
    }
}

fixSidebarLinks()
