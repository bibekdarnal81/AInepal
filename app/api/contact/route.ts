import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import { ContactMessage } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, subject, message, company, budget, services, website, contact_method } = body

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
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

        await dbConnect()

        // Insert contact message into database
        const contactMessage = await ContactMessage.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
            subject: subject?.trim() || null,
            message: message.trim(),
            company: company?.trim() || null,
            budget: budget?.trim() || null,
            services: services || [],
            website: website?.trim() || null,
            contactMethod: contact_method || 'email',
            isRead: false
        })

        return NextResponse.json(
            {
                success: true,
                message: 'Message sent successfully',
                data: {
                    id: contactMessage._id.toString(),
                    name: contactMessage.name,
                    email: contactMessage.email,
                    createdAt: contactMessage.createdAt,
                }
            },
            { status: 200 }
        )

    } catch (error) {
        console.error('API error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
