import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { User, Membership } from '@/lib/mongodb/models'

export async function POST() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Find the Free membership
        // We look for a plan with price 0 or slug 'free'
        const freePlan = await Membership.findOne({
            $or: [{ slug: 'free' }, { price: 0 }],
            isActive: true
        })

        if (!freePlan) {
            return NextResponse.json({ error: 'Free plan not available' }, { status: 404 })
        }

        const membershipExpiresAt = freePlan.durationDays
            ? new Date(Date.now() + freePlan.durationDays * 86400000)
            : null

        // Update user
        await User.findByIdAndUpdate(session.user.id, {
            membershipId: freePlan._id,
            membershipStatus: 'active',
            membershipExpiresAt: membershipExpiresAt,
            // We typically don't reset credits when switching TO free, 
            // unless we want to reset to the free tier limits.
            // For now, let's keep existing credits or maybe add free tier ones if they are lower?
            // User request didn't specify credit logic upon downgrade.
            // Safest is to just update status.
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error switching to free plan:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}
