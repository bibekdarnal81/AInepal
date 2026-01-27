import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { addCredits } from '@/lib/credits'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { amount, packId } = await request.json()

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        await dbConnect()

        // TODO: Integrate with actual payment gateway (Stripe/LemonSqueezy)
        // For now, this is a mock implementation that immediately adds credits

        const description = packId ? `Purchased credit pack: ${packId}` : 'Purchased credits'

        const result = await addCredits(session.user.id, amount, description, {
            packId,
            paymentMethod: 'mock',
            status: 'paid'
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to add credits' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            newBalance: result.newBalance,
            message: `Successfully added ${amount} credits`
        })

    } catch (error) {
        console.error('Error purchasing credits:', error)
        return NextResponse.json(
            { error: 'Failed to process purchase' },
            { status: 500 }
        )
    }
}
