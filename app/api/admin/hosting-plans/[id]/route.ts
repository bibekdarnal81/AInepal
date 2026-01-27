import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { HostingPlan, User } from '@/lib/mongodb/models'

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

        // Verify Admin
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const deletedPlan = await HostingPlan.findByIdAndDelete(params.id)

        if (!deletedPlan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Plan deleted successfully' })
    } catch (error) {
        console.error('Error deleting hosting plan:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const updatedPlan = await HostingPlan.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        )

        if (!updatedPlan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        return NextResponse.json(updatedPlan)
    } catch (error) {
        console.error('Error updating hosting plan:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
