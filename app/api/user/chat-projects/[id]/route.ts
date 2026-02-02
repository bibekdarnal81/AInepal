import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { ChatProject, UserChatSession } from '@/lib/mongodb/models'

// DELETE - Remove a chat project
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        await dbConnect()

        // Nullify projectId for all chats in this project
        await UserChatSession.updateMany(
            { projectId: id, userId: session.user.id },
            { $unset: { projectId: 1 } }
        )

        // Delete the project
        await ChatProject.deleteOne({ _id: id, userId: session.user.id })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting chat project:', error)
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}

// PATCH - Rename a chat project
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        await dbConnect()

        await ChatProject.updateOne(
            { _id: id, userId: session.user.id },
            { $set: { name, updatedAt: new Date() } }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating chat project:', error)
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }
}
