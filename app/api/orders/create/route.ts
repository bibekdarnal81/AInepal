import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Order } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to make a purchase.' },
                { status: 401 }
            )
        }

        // Get request body
        const body = await request.json()
        const { itemType, itemId, itemTitle, itemSlug, amount, currency } = body

        // Validate required fields
        if (!itemType || !itemId || !itemTitle || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate item type
        const validTypes = ['service', 'course', 'project', 'hosting', 'domain', 'bundle', 'class']
        if (!validTypes.includes(itemType)) {
            return NextResponse.json(
                { error: 'Invalid item type' },
                { status: 400 }
            )
        }

        await dbConnect()

        // Create order
        const order = await Order.create({
            userId: new mongoose.Types.ObjectId(session.user.id),
            itemType,
            itemId: new mongoose.Types.ObjectId(itemId),
            itemTitle,
            itemSlug: itemSlug || null,
            amount: parseFloat(amount),
            currency: currency || 'NPR',
            status: 'pending',
        })

        return NextResponse.json({
            success: true,
            order: {
                id: order._id.toString(),
                itemType: order.itemType,
                itemTitle: order.itemTitle,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                createdAt: order.createdAt,
            },
            message: 'Order created successfully'
        })

    } catch (error) {
        console.error('Order API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
