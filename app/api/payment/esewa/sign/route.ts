import { NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/mongodb/client'
import SiteSettings from '@/lib/mongodb/models/SiteSettings'

export async function POST(request: Request) {
    try {
        await dbConnect()

        // Fetch API credentials
        const settings = await SiteSettings.findOne({ key: 'main' }).select('payment.esewa')
        const esewaConfig = settings?.payment?.esewa

        if (!esewaConfig || !esewaConfig.enabled) {
            return NextResponse.json({ error: 'eSewa API is not enabled' }, { status: 400 })
        }

        const { amount, transaction_uuid, product_code } = await request.json()

        if (!amount || !transaction_uuid) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Signature Format: "total_amount=VAL,transaction_uuid=VAL,product_code=VAL"

        const code = product_code || 'EPAYTEST'
        const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${code}`

        // Generate HMAC-SHA256 Signature
        const signature = crypto
            .createHmac('sha256', esewaConfig.secret)
            .update(message)
            .digest('base64')

        return NextResponse.json({
            signature,
            merchantId: esewaConfig.merchantId,
            product_code: product_code || 'EPAYTEST',
            environment: esewaConfig.environment
        })

    } catch (error) {
        console.error('eSewa Signature Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
