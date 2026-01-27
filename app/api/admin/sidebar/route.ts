import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { SiteSettings, User } from '@/lib/mongodb/models'

// Default sidebar items
const DEFAULT_SIDEBAR_ITEMS = [
    { key: 'chat', label: 'Chat', href: '/chat', icon: 'MessageSquare', visible: true, order: 0 },
    { key: 'image', label: 'Image', href: '/chat/image', icon: 'Image', visible: true, order: 1 },
    { key: 'video', label: 'Video', href: '/chat/video', icon: 'Video', visible: true, order: 2 },
    { key: 'audio', label: 'Audio', href: '/chat/audio', icon: 'Headphones', visible: true, order: 3 },
]

// GET - Get sidebar settings (public for sidebar component)
export async function GET() {
    try {
        await dbConnect()

        let settings = await SiteSettings.findOne({ key: 'main' })

        if (!settings) {
            // Create default settings if not exists
            settings = await SiteSettings.create({
                key: 'main',
                sidebarItems: DEFAULT_SIDEBAR_ITEMS
            })
        }

        return NextResponse.json({
            sidebarItems: settings.sidebarItems.sort((a, b) => a.order - b.order)
        })
    } catch (error) {
        console.error('Error fetching sidebar settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

// PUT - Update sidebar settings (admin only)
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify admin
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { sidebarItems } = body

        if (!sidebarItems || !Array.isArray(sidebarItems)) {
            return NextResponse.json({ error: 'Invalid sidebar items' }, { status: 400 })
        }

        const settings = await SiteSettings.findOneAndUpdate(
            { key: 'main' },
            { sidebarItems },
            { new: true, upsert: true }
        )

        return NextResponse.json({
            success: true,
            sidebarItems: settings.sidebarItems.sort((a, b) => a.order - b.order)
        })
    } catch (error) {
        console.error('Error updating sidebar settings:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
