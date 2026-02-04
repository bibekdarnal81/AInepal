import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import { User } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
    try {
        const { email, token } = await request.json()

        if (!token || !email) {
            return NextResponse.json({ error: 'Email and Token are required' }, { status: 400 })
        }

        await dbConnect()

        const user = await User.findOne({
            email: email.toLowerCase(),
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        })

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        // Use updateOne to ensure fields are fully removed from the database
        await User.updateOne(
            { _id: user._id },
            {
                $set: { emailVerified: new Date() },
                $unset: { verificationToken: 1, verificationTokenExpires: 1 }
            }
        )

        return NextResponse.json({ message: 'Email verified successfully', success: true })
    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
