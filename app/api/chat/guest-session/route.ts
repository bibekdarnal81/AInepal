import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomBytes } from 'crypto'

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

        // Generate unique session token
        const sessionToken = randomBytes(32).toString('hex')

        // Create guest session in database using admin client (bypasses RLS)
        const supabase = createAdminClient()
        const { data: session, error } = await supabase
            .from('guest_chat_sessions')
            .insert({
                guest_name: name.trim(),
                guest_email: email.trim().toLowerCase(),
                guest_phone: phone?.trim() || null,
                initial_question: question?.trim() || null,
                session_token: sessionToken
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating guest session:', error)
            return NextResponse.json(
                {
                    error: 'Failed to create guest session',
                    details: error.message,
                    code: error.code,
                    hint: error.hint
                },
                { status: 500 }
            )
        }

        // If there's an initial question, create the first chat message
        if (question?.trim()) {
            await supabase
                .from('chat_messages')
                .insert({
                    guest_session_id: session.id,
                    message: question.trim(),
                    is_admin: false,
                    is_read: false
                })
        }

        return NextResponse.json(session)
    } catch (error) {
        console.error('Error in guest session API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
