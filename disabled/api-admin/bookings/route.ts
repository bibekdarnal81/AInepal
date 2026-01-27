import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all contact messages/bookings
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated and is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get query parameters for filtering
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status') // 'read' | 'unread' | 'all'
        const search = searchParams.get('search')
        const service = searchParams.get('service')

        let query = supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })

        // Filter by read status
        if (status === 'read') {
            query = query.eq('is_read', true)
        } else if (status === 'unread') {
            query = query.eq('is_read', false)
        }

        // Search filter
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,message.ilike.%${search}%`)
        }

        // Service filter
        if (service && service !== 'all') {
            query = query.contains('services', [service])
        }

        const { data, error } = await query

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

// PATCH - Update booking status
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated and is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, is_read, status } = body

        if (!id) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            )
        }

        const updateData: any = {}
        if (typeof is_read === 'boolean') {
            updateData.is_read = is_read
        }
        if (status) {
            updateData.status = status
        }

        const { data, error } = await supabase
            .from('contact_messages')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating booking:', error)
            return NextResponse.json(
                { error: 'Failed to update booking' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, booking: data })
    } catch (error: any) {
        console.error('Error updating booking:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update booking' },
            { status: 500 }
        )
    }
}

// DELETE - Delete a booking
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated and is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            )
        }

        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting booking:', error)
            return NextResponse.json(
                { error: 'Failed to delete booking' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting booking:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete booking' },
            { status: 500 }
        )
    }
}
