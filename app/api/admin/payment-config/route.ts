import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import SiteSettings from '@/lib/mongodb/models/SiteSettings'

export async function GET() {
    try {
        await dbConnect()
        const settings = await SiteSettings.findOne({ key: 'main' }).select('payment')

        return NextResponse.json({
            payment: settings?.payment?.esewa || {
                merchantId: '',
                secret: '',
                environment: 'test',
                enabled: false
            }
        })
    } catch (error) {
        console.error('Error fetching payment config:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect()
        const body = await request.json()
        const { merchantId, secret, environment, enabled } = body

        const settings = await SiteSettings.findOneAndUpdate(
            { key: 'main' },
            {
                $set: {
                    'payment.esewa': {
                        merchantId,
                        secret,
                        environment,
                        enabled
                    }
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return NextResponse.json({ success: true, payment: settings?.payment?.esewa })
    } catch (error) {
        console.error('Error updating payment config:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
