import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import {
    HostingOrder,
    Order,
    Domain,
    User,
    HostingPlan,
    BundleOffer,
    Service,
    Class,
    Project,
    Membership,
    type OrderItemType
} from '@/lib/mongodb/models'
import mongoose from 'mongoose'

export async function POST(req: Request) {
    try {
        await dbConnect()
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {
            type,
            itemId,
            amount,
            paymentMethodId,
            paymentProofUrl,
            transactionId,
            billingCycle, // Hosting specific
            domainName,   // Domain specific
            years,        // Domain specific
            requirements,  // Service specific
            enroll // Class enrollment details
        } = await req.json()

        const userId = session.user.id
        let orderId
        let newOrder

        if (type === 'hosting') {
            const plan = await HostingPlan.findById(itemId)
            if (!plan) throw new Error('Hosting plan not found')

            newOrder = await HostingOrder.create({
                userId,
                planId: itemId,
                billingCycle,
                domain: domainName,
                paymentMethodId: paymentMethodId,
                paymentProofUrl: paymentProofUrl,
                transactionId: transactionId,
                price: amount,
                status: 'pending',
            })
            orderId = newOrder._id

        } else if (['services', 'projects', 'bundles', 'classes', 'memberships'].includes(type)) {
            // Map type to itemType
            let itemType: OrderItemType = 'service'
            let itemTitle = ''
            let itemSlug = ''

            if (type === 'services') {
                itemType = 'service'
                const service = await Service.findById(itemId)
                if (service) { itemTitle = service.title; itemSlug = service.slug }
            } else if (type === 'projects') {
                itemType = 'service' // Mapping projects to 'service' instead of 'course'
                const project = await Project.findById(itemId)
                if (project) { itemTitle = project.title; itemSlug = project.slug }
            } else if (type === 'bundles') {
                itemType = 'bundle'
                const bundle = await BundleOffer.findById(itemId)
                if (bundle) { itemTitle = bundle.name; }
            } else if (type === 'classes') {
                itemType = 'class'
                const cls = await Class.findById(itemId)
                if (cls) { itemTitle = cls.title; itemSlug = cls.slug }
            } else if (type === 'memberships') {
                itemType = 'membership'
                const membership = await Membership.findById(itemId)
                if (membership) { itemTitle = membership.name; itemSlug = membership.slug }
            }

            newOrder = await Order.create({
                userId,
                itemType,
                itemId,
                itemTitle,
                itemSlug,
                amount,
                paymentMethod: paymentMethodId,
                paymentId: transactionId,
                notes: paymentProofUrl,
                // Wait, Order schema has: paymentMethod, paymentId.
                // It does not have paymentProofUrl field.
                // I will store paymentProofUrl in metadata.
                status: 'pending',
                metadata: {
                    paymentProofUrl,
                    requirements,
                    enroll,
                    billingCycle,
                    domainName,
                    years
                }
            })
            orderId = newOrder._id

        } else if (type === 'domains') {
            // For domains, we usually create a Domain record AND an Order record?
            // Or just an Order record.
            // The supabase code inserted into 'domain_orders'.
            // I'll create an Order with itemType='domain'.
            newOrder = await Order.create({
                userId,
                itemType: 'domain',
                itemId: new mongoose.Types.ObjectId(), // No specific item ID for new domain reg
                itemTitle: domainName,
                amount,
                status: 'pending',
                paymentMethod: paymentMethodId,
                paymentId: transactionId,
                metadata: {
                    paymentProofUrl,
                    domainName,
                    years
                }
            })

            // Also optionally create a Domain record if needed, but usually we wait for payment.
            // But let's create a pending Domain record.
            await Domain.create({
                userId,
                domainName,
                tld: domainName.split('.').pop() || 'com',
                price: amount, // rough est
                status: 'pending',
                autoRenew: true
            })

            orderId = newOrder._id
        } else {
            return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
        }

        return NextResponse.json({ success: true, orderId })

    } catch (error: unknown) {
        console.error('Checkout error:', error)
        const message = error instanceof Error ? error.message : 'Checkout failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
