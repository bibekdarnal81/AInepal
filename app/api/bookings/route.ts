import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
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

        // Create chat message for the booking
        const bookingMessage = `📅 Booking Request: ${serviceName} on ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`

        const { data: messageData, error: messageError } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                message: bookingMessage,
                is_admin: false,
                is_read: false
            })
            .select()
            .single()

        if (messageError) {
            console.error('Error creating chat message:', messageError)
            return NextResponse.json(
                { error: 'Failed to create booking message' },
                { status: 500 }
            )
        }

        // Create booking record
        const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                user_id: user.id,
                service_type: serviceType,
                service_name: serviceName,
                booking_date: bookingDate,
                booking_time: bookingTime,
                duration: duration || 60,
                status: 'pending',
                notes: notes || null,
                chat_message_id: messageData.id
            })
            .select()
            .single()

        if (bookingError) {
            console.error('Error creating booking:', bookingError)
            return NextResponse.json(
                { error: 'Failed to create booking' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            booking: bookingData,
            message: messageData
        })
    } catch (error: any) {
        console.error('Error creating booking:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create booking' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch user's bookings
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true })

        if (error) {
            console.error('Error fetching bookings:', error)
            return NextResponse.json(
                { error: 'Failed to fetch bookings' },
                { status: 500 }
            )
        }

        return NextResponse.json({ bookings: data })
    } catch (error: any) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch bookings' },
            { status: 500 }
        )
    }
}
