import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBundleOffer extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    description?: string
    hostingType: string
    price: number
    discountPercent: number
    poster?: string
    showOnHome: boolean
    isActive: boolean
    createdAt: Date
}

const BundleOfferSchema = new Schema<IBundleOffer>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        hostingType: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        discountPercent: {
            type: Number,
            default: 0,
        },
        poster: {
            type: String,
        },
        showOnHome: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
)

// Indexes
BundleOfferSchema.index({ isActive: 1 })
BundleOfferSchema.index({ showOnHome: 1 })

export const BundleOffer: Model<IBundleOffer> =
    mongoose.models.BundleOffer ||
    mongoose.model<IBundleOffer>('BundleOffer', BundleOfferSchema)

export default BundleOffer
