import mongoose, { Schema, Document, Model } from 'mongoose'

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'
export type OrderItemType = 'service' | 'course' | 'hosting' | 'domain' | 'bundle' | 'class' | 'membership' | 'credit_pack'

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    itemType: OrderItemType
    itemId: mongoose.Types.ObjectId
    itemTitle: string
    itemSlug?: string
    amount: number
    currency: string
    status: OrderStatus
    paymentMethod?: string
    paymentId?: string
    notes?: string
    metadata?: Record<string, unknown>
    bundleId?: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        itemType: {
            type: String,
            enum: ['service', 'course', 'hosting', 'domain', 'bundle', 'class', 'membership', 'credit_pack'],
            required: true,
        },
        itemId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        itemTitle: {
            type: String,
            required: true,
        },
        itemSlug: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'NPR',
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'cancelled', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
        },
        paymentId: {
            type: String,
        },
        notes: {
            type: String,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        bundleId: {
            type: Schema.Types.ObjectId,
            ref: 'BundleOffer',
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ itemType: 1 })
OrderSchema.index({ createdAt: -1 })

export const Order: Model<IOrder> =
    (() => {
        if (mongoose.models.Order) {
            delete mongoose.models.Order
        }
        return mongoose.model<IOrder>('Order', OrderSchema)
    })()

export default Order
