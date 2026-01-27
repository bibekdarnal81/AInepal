import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBundleItem extends Document {
    _id: mongoose.Types.ObjectId
    bundleId: mongoose.Types.ObjectId
    itemType: string
    itemId?: mongoose.Types.ObjectId
    quantity: number
    description?: string
    createdAt: Date
}

const BundleItemSchema = new Schema<IBundleItem>(
    {
        bundleId: {
            type: Schema.Types.ObjectId,
            ref: 'BundleOffer',
            required: true,
        },
        itemType: {
            type: String,
            required: true,
        },
        itemId: {
            type: Schema.Types.ObjectId,
        },
        quantity: {
            type: Number,
            default: 1,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
)

// Index
BundleItemSchema.index({ bundleId: 1 })

export const BundleItem: Model<IBundleItem> =
    mongoose.models.BundleItem ||
    mongoose.model<IBundleItem>('BundleItem', BundleItemSchema)

export default BundleItem
