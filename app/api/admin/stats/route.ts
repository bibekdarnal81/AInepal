import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Post, User, GuestChatSession } from '@/lib/mongodb/models'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET() {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()

        const [
            totalPosts,
            publishedPosts,
            draftPosts,
            registeredUsers,
            guestUsers
        ] = await Promise.all([
            Post.countDocuments(),
            Post.countDocuments({ isPublished: true }),
            Post.countDocuments({ isPublished: false }),
            User.countDocuments({ isAdmin: { $ne: true } }),
            GuestChatSession.countDocuments()
        ])

        const recentUsers = await User.find({ isAdmin: { $ne: true } })
            .select('displayName email avatarUrl createdAt')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()

        const typedRecentUsers = recentUsers as Array<{
            _id: string
            displayName?: string
            email?: string
            avatarUrl?: string
            createdAt: Date
        }>
        const transformedRecentUsers = typedRecentUsers.map((u) => ({
            id: u._id.toString(),
            name: u.displayName || u.email || 'User',
            email: u.email,
            date: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            image: u.avatarUrl,
            avatarColor: 'bg-primary'
        }))

        return NextResponse.json({
            stats: {
                totalPosts,
                publishedPosts,
                draftPosts,
                registeredUsers,
                guestUsers
            },
            recentUsers: transformedRecentUsers
        })
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
