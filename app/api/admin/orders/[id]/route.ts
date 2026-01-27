import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Order, User } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin Status
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const deletedOrder = await Order.findByIdAndDelete(id)

        if (!deletedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Order deleted successfully' })
    } catch (error) {
        console.error('Error deleting order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
