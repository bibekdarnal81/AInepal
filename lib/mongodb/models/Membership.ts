import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMembership extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    slug: string
    description?: string
    price: number
    priceMonthly?: number
    priceYearly?: number
    yearlyDiscountPercent?: number
    discount?: number
    currency: string
    durationDays: number
    features: string[]
    featureCategories?: {
        categoryName: string
        items: { icon?: string; name: string }[]
    }[]
    advancedCredits?: number
    appIntegrationIcons?: string[]
    platformIcons?: string[]
    badgeText?: string
    iconName?: string
    imageUrl?: string
    additionalSections?: {
        title?: string
        text?: string
        imageUrl?: string
        videoUrl?: string
        quote?: string
        heading?: string
        embedHtml?: string
    }[]
    isActive: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
}

const MembershipSchema = new Schema<IMembership>(
    {
        name: {
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
        price: {
            type: Number,
            default: 0,
        },
        priceMonthly: {
            type: Number,
        },
        priceYearly: {
            type: Number,
        },
        yearlyDiscountPercent: {
            type: Number,
        },
        discount: {
            type: Number,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        durationDays: {
            type: Number,
            default: 30,
        },
        features: {
            type: [String],
            default: [],
        },
        featureCategories: [
            {
                categoryName: { type: String },
                items: [
                    {
                        icon: { type: String },
                        name: { type: String },
                    },
                ],
            },
        ],
        advancedCredits: {
            type: Number,
        },
        appIntegrationIcons: {
            type: [String],
            default: [],
        },
        platformIcons: {
            type: [String],
            default: [],
        },
        badgeText: {
            type: String,
        },
        iconName: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
        },
        additionalSections: [
            {
                title: { type: String },
                text: { type: String },
                imageUrl: { type: String },
                videoUrl: { type: String },
                quote: { type: String },
                heading: { type: String },
                embedHtml: { type: String },
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

MembershipSchema.index({ isActive: 1 })
MembershipSchema.index({ sortOrder: 1 })

export const Membership: Model<IMembership> =
    mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema)

export default Membership
