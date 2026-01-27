import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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
        const status = searchParams.get('status')
        const service = searchParams.get('service')
        const search = searchParams.get('search')

        const query: Record<string, unknown> = {}
        if (status === 'read') query.isRead = true
        else if (status === 'unread') query.isRead = false

        if (service && service !== 'all') query.services = service

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ]
        }

        const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).lean()
        const typedMessages = messages as Array<{
            _id: mongoose.Types.ObjectId
            name: string
            company?: string
            email: string
            phone?: string
            subject?: string
            message: string
            budget?: string
            services?: string[]
            website?: string
            contactMethod?: string
            isRead: boolean
            createdAt: Date
        }>

        return NextResponse.json({
            bookings: typedMessages.map((m) => ({
                id: m._id.toString(),
                name: m.name,
                company: m.company || null,
                email: m.email,
                phone: m.phone || null,
                subject: m.subject || null,
                message: m.message,
                budget: m.budget || null,
                services: m.services || [],
                website: m.website || null,
                contact_method: m.contactMethod || 'email',
                is_read: m.isRead,
                created_at: m.createdAt.toISOString()
            }))
        })
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { id, is_read } = await request.json()

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { isRead: is_read },
            { new: true }
        )

        if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating booking:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const id = new URL(request.url).searchParams.get('id')

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        await dbConnect()
        const message = await ContactMessage.findByIdAndDelete(id)

        if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting booking:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
