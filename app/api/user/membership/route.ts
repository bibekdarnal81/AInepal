import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { User } from '@/lib/mongodb/models/index'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Explicitly register Membership model to avoid missing schema errors during population
        // (Though creating the User model should have likely triggered it via imports, safety first)
        // Actually, importing Membership from index is enough if the model file does the registration.

        const user = await User.findOne({ email: session.user.email })
            .select('membershipId membershipStatus')
            .populate('membershipId')
            .lean()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const membership = (user as { membershipId?: { _id: string; name?: string } | null }).membershipId

        return NextResponse.json({
            membershipStatus: user.membershipStatus,
            planName: membership?.name || 'Free Plan',
            planId: membership?._id || null
        })

    } catch (error: unknown) {
        console.error('Error fetching user membership:', error)
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
