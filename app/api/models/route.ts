import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { AIModel } from '@/lib/mongodb/models'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const models = await AIModel.find({
            isActive: true,
            disabled: { $ne: true }
        })
            .select('_id modelId displayName provider icon')
            .sort({ displayOrder: 1 })
            .lean()

        return NextResponse.json({ models })
    } catch (error) {
        console.error('Error fetching models:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
