import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { User, Membership } from '@/lib/mongodb/models'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const user = await User.findById(session.user.id)
            .select('credits advancedCredits membershipId membershipStatus isSuspended')
            .lean()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        let membershipName = ''
        let membershipAdvancedCredits = 0

        // Fetch membership info if user has active membership
        if (user.membershipId && user.membershipStatus === 'active') {
            const membership = await Membership.findById(user.membershipId)
                .select('name advancedCredits')
                .lean()
            if (membership) {
                membershipName = membership.name || ''
                membershipAdvancedCredits = membership.advancedCredits || 0
            }
        }

        return NextResponse.json({
            credits: user.credits || 0,
            advancedCredits: user.advancedCredits || 0,
            membershipName,
            membershipAdvancedCredits,
            isSuspended: user.isSuspended || false
        })
    } catch (error) {
        console.error('Error fetching credits:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
