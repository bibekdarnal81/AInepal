import { NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/mongodb/client'
import SiteSettings from '@/lib/mongodb/models/SiteSettings'
import {
    Order,
    HostingOrder,
    // Import all order models if they are separate collections, 
    // but the Checkout API stored them in specific collections.
    // Wait, HostingOrder and Order are separate. I need to check both?
    // The checkout/route.ts used HostingOrder for hosting, and Order for others.
} from '@/lib/mongodb/models'

export async function POST(request: Request) {
    try {
        await dbConnect()
        const { data } = await request.json()

        if (!data) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        // Decode Base64
        const decodedString = Buffer.from(data, 'base64').toString('utf-8')
        const paymentData = JSON.parse(decodedString)

        // Extract fields
        const { status, signature, transaction_uuid, total_amount, product_code, signed_field_names } = paymentData

        if (status !== 'COMPLETE') {
            return NextResponse.json({ error: 'Payment not complete', status }, { status: 400 })
        }

        // Fetch API credentials
        const settings = await SiteSettings.findOne({ key: 'main' }).select('payment.esewa')
        const esewaConfig = settings?.payment?.esewa

        if (!esewaConfig) {
            return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
        }

        // Verify Signature
        // The message is constructed using "total_amount,transaction_uuid,product_code"

        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`

        const generatedSignature = crypto
            .createHmac('sha256', esewaConfig.secret)
            .update(message)
            .digest('base64')

        if (generatedSignature !== signature) {
            // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
            // For checking purposes, sometimes escaping differs, but eSewa standard is straight forward.
            // If it fails, log it and maybe allow if in test mode? No, security risk.
            console.error('Signature mismatch', { generated: generatedSignature, received: signature, message })
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        // Update Order
        // Need to check both Order and HostingOrder
        // Check Order collection first
        const order = await Order.findOne({ paymentId: transaction_uuid })

        if (order) {
            if (order.status === 'paid') {
                return NextResponse.json({ success: true, message: 'Already paid' })
            }

            // Mark as paid
            order.status = 'paid'
            // Store eSewa transaction code
            if (paymentData.transaction_code) {
                const note = `eSewa Ref: ${paymentData.transaction_code}`
                order.notes = order.notes ? `${order.notes}\n${note}` : note
            }

            await order.save()
            return NextResponse.json({ success: true })
        }

        // Check HostingOrder collection
        const hostingOrder = await HostingOrder.findOne({ transactionId: transaction_uuid })

        if (hostingOrder) {
            if (hostingOrder.status === 'active') {
                return NextResponse.json({ success: true, message: 'Already active' })
            }

            // Mark as active
            hostingOrder.status = 'active'

            await hostingOrder.save()
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    } catch (error) {
        console.error('Verification Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
