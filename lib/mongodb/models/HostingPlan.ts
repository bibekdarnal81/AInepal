import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHostingPlan extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    slug: string
    storageGb: number
    bandwidthText: string
    price: number
    yearlyPrice?: number
    currency: string
    features: string[]
    planType?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const HostingPlanSchema = new Schema<IHostingPlan>(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        storageGb: {
            type: Number,
            required: true,
        },
        bandwidthText: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        yearlyPrice: {
            type: Number,
        },
        currency: {
            type: String,
            default: 'NPR',
        },
        features: {
            type: [String],
            default: [],
        },
        planType: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

// Index


export const HostingPlan: Model<IHostingPlan> =
    mongoose.models.HostingPlan ||
    mongoose.model<IHostingPlan>('HostingPlan', HostingPlanSchema)

export default HostingPlan
