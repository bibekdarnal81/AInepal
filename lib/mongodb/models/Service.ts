import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IService extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    description?: string
    content?: string
    price: number
    currency: string
    iconName?: string
    thumbnailUrl?: string
    features: string[]
    category?: string
    subcategory?: string
    isFeatured: boolean
    isPublished: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

const ServiceSchema = new Schema<IService>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
        },
        content: {
            type: String,
        },
        price: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'NPR',
        },
        iconName: {
            type: String,
        },
        thumbnailUrl: {
            type: String,
        },
        features: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
        },
        subcategory: {
            type: String,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes

ServiceSchema.index({ isPublished: 1 })
ServiceSchema.index({ isFeatured: 1 })
ServiceSchema.index({ displayOrder: 1 })
ServiceSchema.index({ category: 1 })

export const Service: Model<IService> =
    mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema)

export default Service
