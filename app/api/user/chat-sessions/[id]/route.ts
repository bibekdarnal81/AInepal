import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { UserChatSession } from '@/lib/mongodb/models'

// GET - Fetch a specific chat session with messages
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await dbConnect()

        const chatSession = await UserChatSession.findOne({
            _id: id,
            userId: session.user.id,
            isActive: true
        }).lean()

        if (!chatSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: chatSession._id.toString(),
            title: chatSession.title,
            modelId: chatSession.modelId,
            messages: chatSession.messages,
            createdAt: chatSession.createdAt,
            updatedAt: chatSession.updatedAt,
        })
    } catch (error) {
        console.error('Error fetching chat session:', error)
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
    }
}
