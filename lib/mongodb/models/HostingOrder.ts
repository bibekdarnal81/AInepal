import mongoose, { Schema, Document, Model } from 'mongoose'

export type HostingOrderStatus = 'pending' | 'active' | 'suspended' | 'cancelled'

export interface IHostingOrder extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    planId: mongoose.Types.ObjectId
    domain?: string
    status: HostingOrderStatus
    price: number
    billingCycle: 'monthly' | 'yearly'
    nextBillingDate?: Date
    bundleId?: mongoose.Types.ObjectId
    paymentMethodId?: string
    paymentProofUrl?: string
    transactionId?: string
    createdAt: Date
    updatedAt: Date
}

const HostingOrderSchema = new Schema<IHostingOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: 'HostingPlan',
            required: true,
        },
        domain: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'suspended', 'cancelled'],
            default: 'pending',
        },
        price: {
            type: Number,
            required: true,
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: 'monthly',
        },
        nextBillingDate: {
            type: Date,
        },
        bundleId: {
            type: Schema.Types.ObjectId,
            ref: 'BundleOffer',
        },
        paymentMethodId: {
            type: String,
        },
        paymentProofUrl: {
            type: String,
        },
        transactionId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
HostingOrderSchema.index({ userId: 1 })
HostingOrderSchema.index({ planId: 1 })
HostingOrderSchema.index({ status: 1 })

export const HostingOrder: Model<IHostingOrder> =
    mongoose.models.HostingOrder ||
    mongoose.model<IHostingOrder>('HostingOrder', HostingOrderSchema)

export default HostingOrder
