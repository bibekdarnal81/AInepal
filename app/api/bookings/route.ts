import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Booking, ChatMessage } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { serviceType, serviceName, bookingDate, bookingTime, duration, notes } = body

        // Validate required fields
        if (!serviceType || !serviceName || !bookingDate || !bookingTime) {
            return NextResponse.json(
                { error: 'Service type, name, date, and time are required' },
                { status: 400 }
            )
        }

        await dbConnect()

        // Create chat message for the booking
        const bookingMessage = `📅 Booking Request: ${serviceName} on ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`

        const chatMessage = await ChatMessage.create({
            userId: session.user.id,
            message: bookingMessage,
            isAdmin: false,
            isRead: false
        })

        // Create booking record
        const booking = await Booking.create({
            userId: session.user.id,
            serviceType,
            serviceName,
            bookingDate: new Date(bookingDate),
            bookingTime,
            duration: duration || 60,
            status: 'pending',
            notes: notes || null,
            chatMessageId: chatMessage._id
        })

        return NextResponse.json({
            success: true,
            booking: {
                id: booking._id.toString(),
                serviceType: booking.serviceType,
                serviceName: booking.serviceName,
                bookingDate: booking.bookingDate,
                bookingTime: booking.bookingTime,
                status: booking.status,
            },
            message: {
                id: chatMessage._id.toString(),
                message: chatMessage.message
            }
        })
    } catch (error) {
        console.error('Error creating booking:', error)
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Fetch user's bookings
        const bookings = await Booking.find({ userId: session.user.id })
            .sort({ bookingDate: 1, bookingTime: 1 })
            .lean()

        return NextResponse.json({
            bookings: bookings.map(b => ({
                ...b,
                id: b._id.toString(),
                _id: undefined
            }))
        })
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        )
    }
}
