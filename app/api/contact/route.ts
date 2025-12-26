import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

        // Create Supabase client
        const supabase = await createClient()

        // Insert contact message into database
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([
                {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone?.trim() || null,
                    subject: subject?.trim() || null,
                    message: message.trim(),
                    company: company?.trim() || null,
                    budget: budget?.trim() || null,
                    services: services || [],
                    website: website?.trim() || null,
                    contact_method: contact_method || 'email',
                    is_read: false
                }
            ])
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
                { error: 'Failed to save message. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Message sent successfully',
                data
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
