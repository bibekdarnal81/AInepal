import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import { SiteSettings } from '@/lib/mongodb/models'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const settings = await SiteSettings.findOne({ key: 'main' })

        return NextResponse.json({
            email: settings?.email || {
                resendApiKey: '',
                fromName: 'AINepal',
                fromEmail: 'onboarding@resend.dev'
            }
        })
    } catch (error) {
        console.error('Error fetching email settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { resendApiKey, fromName, fromEmail } = body

        await dbConnect()

        const settings = await SiteSettings.findOne({ key: 'main' })

        if (settings) {
            if (!settings.email) settings.email = { resendApiKey: '', fromName: '', fromEmail: '' }

            settings.email.resendApiKey = resendApiKey
            settings.email.fromName = fromName
            settings.email.fromEmail = fromEmail

            await settings.save()
        } else {
            await SiteSettings.create({
                key: 'main',
                email: {
                    resendApiKey,
                    fromName,
                    fromEmail
                }
            })
        }

        return NextResponse.json({ success: true, message: 'Email settings updated successfully' })
    } catch (error) {
        console.error('Error updating email settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
