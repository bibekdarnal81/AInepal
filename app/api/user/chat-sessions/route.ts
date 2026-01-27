import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { UserChatSession } from '@/lib/mongodb/models'

// GET - Fetch user's chat sessions
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const page = parseInt(searchParams.get('page') || '1')

        const sessions = await UserChatSession.find({ 
            userId: session.user.id,
            isActive: true 
        })
            .select('_id title updatedAt createdAt')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        const total = await UserChatSession.countDocuments({ 
            userId: session.user.id,
            isActive: true 
        })

        return NextResponse.json({
            sessions: sessions.map(s => ({
                id: s._id.toString(),
                title: s.title,
                updatedAt: s.updatedAt,
                createdAt: s.createdAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Error fetching chat sessions:', error)
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }
}

// POST - Create a new chat session
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const body = await req.json()
        const { title, modelId } = body

        const chatSession = await UserChatSession.create({
            userId: session.user.id,
            title: title || 'New Chat',
            modelId,
            messages: [],
            isActive: true,
        })

        return NextResponse.json({
            id: chatSession._id.toString(),
            title: chatSession.title,
            createdAt: chatSession.createdAt,
        })
    } catch (error) {
        console.error('Error creating chat session:', error)
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }
}

// DELETE - Delete/archive a chat session
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get('id')

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
        }

        await dbConnect()

        // Soft delete by setting isActive to false
        await UserChatSession.updateOne(
            { _id: sessionId, userId: session.user.id },
            { isActive: false }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting chat session:', error)
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
    }
}

// PUT - Update chat session (title, add messages)
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const body = await req.json()
        const { id, title, message } = body

        if (!id) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
        }

        const updateData: Record<string, unknown> = {}
        
        if (title) {
            updateData.title = title
        }

        if (message) {
            // Add message to session
            await UserChatSession.updateOne(
                { _id: id, userId: session.user.id },
                { 
                    $push: { messages: message },
                    $set: { updatedAt: new Date() }
                }
            )
            return NextResponse.json({ success: true })
        }

        if (Object.keys(updateData).length > 0) {
            await UserChatSession.updateOne(
                { _id: id, userId: session.user.id },
                { $set: updateData }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating chat session:', error)
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
    }
}
