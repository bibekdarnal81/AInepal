import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { HostingPlan, User } from '@/lib/mongodb/models'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const plans = await HostingPlan.find().sort({ price: 1 })
        return NextResponse.json(plans)
    } catch (error) {
        console.error('Error fetching hosting plans:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()

        // Basic validation
        if (!body.name || !body.storageGb || !body.price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Generate slug if not provided
        if (!body.slug) {
            body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }

        const newPlan = await HostingPlan.create(body)
        return NextResponse.json(newPlan)
    } catch (error) {
        console.error('Error creating hosting plan:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
