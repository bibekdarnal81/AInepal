import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Membership, User } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const isAdminFilter = searchParams.get('isAdmin')

        const query: Record<string, unknown> = {}
        if (search) query.$or = [{ email: { $regex: search, $options: 'i' } }, { displayName: { $regex: search, $options: 'i' } }]
        if (isAdminFilter === 'true') query.isAdmin = true
        else if (isAdminFilter === 'false') query.isAdmin = false

        const [users, total] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            User.countDocuments(query)
        ])

        const typedUsers = users as unknown as Array<{
            _id: mongoose.Types.ObjectId
            email: string
            displayName?: string
            avatarUrl?: string
            phone?: string
            isAdmin: boolean
            isSuspended?: boolean
            emailVerified?: boolean
            createdAt: Date
            membershipId?: mongoose.Types.ObjectId
            membershipStatus?: string
            membershipExpiresAt?: Date | null
            advancedCredits?: number
        }>

        return NextResponse.json({
            users: typedUsers.map((u) => ({
                id: u._id.toString(), email: u.email, displayName: u.displayName, avatarUrl: u.avatarUrl,
                phone: u.phone, isAdmin: u.isAdmin, isSuspended: u.isSuspended, emailVerified: u.emailVerified, createdAt: u.createdAt,
                membershipId: u.membershipId ? u.membershipId.toString() : null,
                membershipStatus: u.membershipStatus || 'none',
                membershipExpiresAt: u.membershipExpiresAt || null,
                advancedCredits: u.advancedCredits || 0
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { id, isAdmin: newAdminStatus, isSuspended, membershipId, membershipStatus, advancedCreditsToAdd } = await request.json()
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

        const updateData: Record<string, unknown> = {}
        if (typeof newAdminStatus === 'boolean') updateData.isAdmin = newAdminStatus
        if (typeof isSuspended === 'boolean') updateData.isSuspended = isSuspended

        const allowedStatuses = new Set(['none', 'active', 'trialing', 'canceled', 'expired'])
        if (membershipStatus !== undefined) {
            if (!allowedStatuses.has(membershipStatus)) return NextResponse.json({ error: 'Invalid membership status' }, { status: 400 })
            updateData.membershipStatus = membershipStatus
        }

        let normalizedMembershipId: mongoose.Types.ObjectId | null | undefined
        if (membershipId !== undefined) {
            if (!membershipId) {
                normalizedMembershipId = null
                updateData.membershipId = null
                updateData.membershipStatus = 'none'
                updateData.membershipExpiresAt = null
            } else if (!mongoose.Types.ObjectId.isValid(membershipId)) {
                return NextResponse.json({ error: 'Invalid membership ID' }, { status: 400 })
            } else {
                normalizedMembershipId = new mongoose.Types.ObjectId(membershipId)
                updateData.membershipId = normalizedMembershipId
            }
        }

        if (normalizedMembershipId) {
            const membership = await Membership.findById(normalizedMembershipId).select('durationDays advancedCredits').lean()
            if (!membership) return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
            const status = membershipStatus || updateData.membershipStatus || 'active'
            updateData.membershipStatus = status
            if (status === 'expired' || status === 'canceled') {
                updateData.membershipExpiresAt = new Date()
            } else if (status === 'none') {
                updateData.membershipId = null
                updateData.membershipExpiresAt = null
            } else {
                updateData.membershipExpiresAt = new Date(Date.now() + (membership.durationDays || 30) * 86400000)
                // Grant advancedCredits from membership when activating
                if (status === 'active' && membership.advancedCredits) {
                    updateData.advancedCredits = membership.advancedCredits
                }
            }
        } else if (membershipStatus !== undefined) {
            if (membershipStatus === 'none') {
                updateData.membershipId = null
                updateData.membershipExpiresAt = null
            } else if (membershipStatus === 'expired' || membershipStatus === 'canceled') {
                updateData.membershipExpiresAt = new Date()
            }
        }

        if (Object.keys(updateData).length === 0 && !advancedCreditsToAdd) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
        }

        const updateOperation: {
            $set?: Record<string, unknown>
            $inc?: { advancedCredits: number }
        } = {}
        if (Object.keys(updateData).length > 0) updateOperation.$set = updateData
        if (typeof advancedCreditsToAdd === 'number') updateOperation.$inc = { advancedCredits: advancedCreditsToAdd }

        const user = await User.findByIdAndUpdate(id, updateOperation, { new: true })
        if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
