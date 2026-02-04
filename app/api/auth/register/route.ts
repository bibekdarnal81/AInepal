import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/mongodb/client'
import { Membership, User } from '@/lib/mongodb/models'
import { sendVerificationEmail } from '@/lib/mail'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, displayName } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        await dbConnect()

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        const freeMembership = await Membership.findOne({ slug: 'free', isActive: true }).select('durationDays advancedCredits').lean()
        const membershipExpiresAt = freeMembership?.durationDays
            ? new Date(Date.now() + freeMembership.durationDays * 86400000)
            : undefined

        // Create user
        // Generate 6-digit OTP
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            displayName: displayName || email.split('@')[0],
            isAdmin: false,
            membershipId: freeMembership?._id,
            membershipStatus: freeMembership ? 'active' : 'none',
            membershipExpiresAt,
            credits: 50, // Default basic credits
            advancedCredits: freeMembership?.advancedCredits || 50, // Default advanced credits
            verificationToken,
            verificationTokenExpires,
            emailVerified: null,
        })

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken)

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully. Please check your email.',
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    displayName: user.displayName,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
