import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { ChatMessage, GuestChatSession, User } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

type ChatMessageDoc = {
    _id: mongoose.Types.ObjectId
    message: string
    isAdmin: boolean
    isRead: boolean
    imageUrl?: string
    createdAt: Date
}

type GuestSessionDoc = {
    _id: mongoose.Types.ObjectId
    guestName?: string
    guestEmail?: string
    createdAt: Date
}

type UserDoc = {
    _id: mongoose.Types.ObjectId
    displayName?: string
    email?: string
    avatarUrl?: string
    createdAt: Date
}

type Conversation = {
    id: string
    type: 'user' | 'guest'
    name: string
    email?: string
    avatarUrl?: string
    unreadCount: number
    lastMessage: ChatMessageDoc | null
    messages: Array<{
        id: string
        message: string
        isAdmin: boolean
        isRead: boolean
        imageUrl?: string
        createdAt: Date
    }>
    createdAt: Date
}

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const targetUserId = searchParams.get('userId')

        // 1. Get all guest sessions
        const guestSessions = await GuestChatSession.find().sort({ lastActivityAt: -1 }).lean() as unknown as GuestSessionDoc[]

        // 2. Get all distinct user IDs from messages (excluding admins)
        const userIds = await ChatMessage.distinct('userId', { userId: { $exists: true } }) as mongoose.Types.ObjectId[]

        console.log('Admin chat - found userIds with messages:', userIds.map(id => id?.toString()));

        const targetId = targetUserId && mongoose.Types.ObjectId.isValid(targetUserId)
            ? new mongoose.Types.ObjectId(targetUserId)
            : null

        // If a specific user is requested, ensure they are in the list
        const finalUserIds = targetId && !userIds.some((id) => id.toString() === targetUserId)
            ? [...userIds, targetId]
            : userIds

        // Fetch users - exclude admin users from the list (they shouldn't be in user support chats)
        const users = await User.find({
            _id: { $in: finalUserIds },
            isAdmin: { $ne: true }
        })
            .select('displayName email avatarUrl')
            .lean() as unknown as UserDoc[]

        console.log('Admin chat - targetUserId:', targetUserId, 'finalUserIds:', finalUserIds.map(id => id?.toString()), 'found users:', users.map(u => u._id?.toString()));

        // 3. Aggregate conversations
        const guestConversations = await Promise.all(
            guestSessions.map(async (session) => {
                const messages = await ChatMessage.find({ guestSessionId: session._id })
                    .sort({ createdAt: 1 })
                    .lean() as unknown as ChatMessageDoc[]
                if (messages.length === 0) return null
                const unreadCount = messages.filter((m) => !m.isRead && !m.isAdmin).length
                return {
                    id: session._id.toString(),
                    type: 'guest',
                    name: session.guestName || session.guestEmail || 'Anonymous Guest',
                    email: session.guestEmail,
                    unreadCount,
                    lastMessage: messages[messages.length - 1],
                    messages: messages.map((m) => ({
                        id: m._id.toString(), message: m.message, isAdmin: m.isAdmin, isRead: m.isRead, imageUrl: m.imageUrl, createdAt: m.createdAt
                    })),
                    createdAt: session.createdAt
                } as Conversation
            })
        )

        const userConversations = await Promise.all(
            users.map(async (user) => {
                const messages = await ChatMessage.find({ userId: user._id })
                    .sort({ createdAt: 1 })
                    .lean() as unknown as ChatMessageDoc[]
                // Only include users who have messages (except for targeted user)
                if (messages.length === 0 && user._id.toString() !== targetUserId) return null
                const unreadCount = messages.filter((m) => !m.isRead && !m.isAdmin).length
                return {
                    id: user._id.toString(),
                    type: 'user',
                    name: user.displayName || user.email || 'User',
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                    unreadCount,
                    lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
                    messages: messages.map((m) => ({
                        id: m._id.toString(), message: m.message, isAdmin: m.isAdmin, isRead: m.isRead, imageUrl: m.imageUrl, createdAt: m.createdAt
                    })),
                    createdAt: user.createdAt
                } as Conversation
            })
        )

        const filteredGuestConversations = guestConversations.filter(
            (conversation): conversation is Conversation => conversation !== null
        )
        const filteredUserConversations = userConversations.filter(
            (conversation): conversation is Conversation => conversation !== null
        )
        const allConversations = [...filteredGuestConversations, ...filteredUserConversations]
            .sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || a.createdAt
                const bTime = b.lastMessage?.createdAt || b.createdAt
                return new Date(bTime).getTime() - new Date(aTime).getTime()
            })

        return NextResponse.json({ conversations: allConversations })
    } catch (error) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { id, type, message } = await request.json()

        if (!id || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

        const messageData: {
            message: string
            isAdmin: boolean
            isRead: boolean
            userId?: mongoose.Types.ObjectId
            guestSessionId?: mongoose.Types.ObjectId
        } = {
            message,
            isAdmin: true,
            isRead: true
        }

        if (type === 'user') {
            messageData.userId = new mongoose.Types.ObjectId(id)
        } else {
            messageData.guestSessionId = new mongoose.Types.ObjectId(id)
        }

        const chatMessage = await ChatMessage.create(messageData)

        return NextResponse.json({ success: true, message: { id: chatMessage._id.toString() } })
    } catch (error) {
        console.error('Error sending reply:', error)
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { id, type } = await request.json()

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const query: { isAdmin: boolean; userId?: mongoose.Types.ObjectId; guestSessionId?: mongoose.Types.ObjectId } = { isAdmin: false }
        if (type === 'user') {
            query.userId = new mongoose.Types.ObjectId(id)
        } else {
            query.guestSessionId = new mongoose.Types.ObjectId(id)
        }

        // Mark all messages in this session as read
        await ChatMessage.updateMany(query, { isRead: true })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error marking messages as read:', error)
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
    }
}

// DELETE - Delete a conversation
export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const type = searchParams.get('type')

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        if (type === 'user') {
            // For registered users, we clear their message history
            await ChatMessage.deleteMany({ userId: new mongoose.Types.ObjectId(id) })
        } else {
            // For guests, we delete the session and its messages
            await ChatMessage.deleteMany({ guestSessionId: new mongoose.Types.ObjectId(id) })
            await GuestChatSession.findByIdAndDelete(id)
        }

        return NextResponse.json({ success: true, message: 'Conversation deleted' })
    } catch (error) {
        console.error('Error deleting conversation:', error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
