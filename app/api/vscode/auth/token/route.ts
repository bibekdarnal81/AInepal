import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { UserApiKey } from '@/lib/mongodb/models'
import crypto from 'crypto'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Generate a random key
        // Format: sk_vscode_<random string>
        const randomBytes = crypto.randomBytes(32).toString('hex')
        const key = `sk_vscode_${randomBytes}`

        // Create the API Key record
        // Note: In a production environment, you might want to hash this key before storing
        // For now storing it as-is for simplicity as per plan
        const newKey = await UserApiKey.create({
            userId: session.user.id,
            name: 'VS Code Extension',
            key: key,
            lastUsedAt: new Date(),
        })

        return NextResponse.json({ token: newKey.key })

    } catch (error) {
        console.error('Token generation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
