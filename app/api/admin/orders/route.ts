import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Membership, Order, User } from '@/lib/mongodb/models'
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
        const status = searchParams.get('status')
        const itemType = searchParams.get('itemType')

        const query: Record<string, unknown> = {}
        if (status) query.status = status
        if (itemType) query.itemType = itemType

        const [orders, total] = await Promise.all([
            Order.find(query).populate('userId', 'email displayName').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Order.countDocuments(query)
        ])

        const typedOrders = orders as Array<{
            _id: mongoose.Types.ObjectId
            userId?: { _id?: mongoose.Types.ObjectId; email?: string; displayName?: string } | null
            itemType: string
            itemId?: mongoose.Types.ObjectId
            itemTitle: string
            itemSlug?: string
            amount: number
            currency: string
            status: string
            paymentMethod?: string
            createdAt: Date
        }>

        return NextResponse.json({
            orders: typedOrders.map((o) => ({
                id: o._id.toString(), userId: o.userId?._id?.toString(), userEmail: o.userId?.email,
                userName: o.userId?.displayName, itemType: o.itemType, itemId: o.itemId?.toString(),
                itemTitle: o.itemTitle, itemSlug: o.itemSlug, amount: o.amount, currency: o.currency,
                status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt
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
        const { id, status } = await request.json()
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

        const order = await Order.findById(id)
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

        // If status is changing to 'paid', handle automatic fulfillment
        if (status === 'paid' && order.status !== 'paid') {
            if (order.itemType === 'membership') {
                const membership = await Membership.findById(order.itemId)
                if (membership) {
                    // Check metadata for billing cycle
                    // order.metadata is typically a Map or an object depending on Mongoose schema type
                    // Safe check:
                    let isYearly = false
                    if (order.metadata) {
                        if (order.metadata instanceof Map) {
                            isYearly = order.metadata.get('billingCycle') === 'yearly'
                        } else {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            isYearly = (order.metadata as any).billingCycle === 'yearly'
                        }
                    }

                    const durationDays = isYearly ? 365 : (membership.durationDays || 30)
                    const expiresAt = new Date(Date.now() + durationDays * 86400000)

                    await User.findByIdAndUpdate(order.userId, {
                        membershipId: membership._id,
                        membershipStatus: 'active',
                        membershipExpiresAt: expiresAt,
                        $inc: { credits: membership.advancedCredits || 0 }
                    })
                }
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true })
        if (!updatedOrder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
