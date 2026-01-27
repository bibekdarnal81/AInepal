import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import dbConnect from '@/lib/mongodb/client'
import { GuestChatSession, ChatMessage } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, question } = await request.json()

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Validate phone format if provided
        if (phone) {
            const digitsOnly = phone.replace(/\D/g, '')
            if (digitsOnly.length < 10) {
                return NextResponse.json(
                    { error: 'Invalid phone number format' },
                    { status: 400 }
                )
            }
        }

        await dbConnect()

        // Generate unique session token
        const sessionToken = randomBytes(32).toString('hex')

        // Create guest session in database
        const session = await GuestChatSession.create({
            sessionToken,
            guestName: name.trim(),
            guestEmail: email.trim().toLowerCase(),
            isActive: true,
            lastActivityAt: new Date(),
        })

        // If there's an initial question, create the first chat message
        if (question?.trim()) {
            await ChatMessage.create({
                guestSessionId: session._id,
                message: question.trim(),
                isAdmin: false,
                isRead: false
            })
        }

        return NextResponse.json({
            id: session._id.toString(),
            session_token: session.sessionToken,
            guest_name: session.guestName,
            guest_email: session.guestEmail,
            is_active: session.isActive,
            created_at: session.createdAt,
        })
    } catch (error) {
        console.error('Error in guest session API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
