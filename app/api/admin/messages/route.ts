import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { ContactMessage } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const isRead = searchParams.get('isRead')

        const query: Record<string, unknown> = {}
        if (isRead === 'true') query.isRead = true
        else if (isRead === 'false') query.isRead = false

        const [messages, total, unreadCount] = await Promise.all([
            ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            ContactMessage.countDocuments(query),
            ContactMessage.countDocuments({ isRead: false })
        ])

        const typedMessages = messages as unknown as Array<{
            _id: mongoose.Types.ObjectId
            name: string
            email: string
            phone?: string
            subject?: string
            message: string
            company?: string
            services?: string[]
            isRead: boolean
            createdAt: Date
        }>

        return NextResponse.json({
            messages: typedMessages.map((m) => ({
                id: m._id.toString(), name: m.name, email: m.email, phone: m.phone, subject: m.subject,
                message: m.message, company: m.company, services: m.services || [], isRead: m.isRead, createdAt: m.createdAt
            })),
            unreadCount,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { id, isRead } = await request.json()
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        await ContactMessage.findByIdAndUpdate(id, { isRead })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const id = new URL(request.url).searchParams.get('id')
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        await dbConnect()
        await ContactMessage.findByIdAndDelete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
