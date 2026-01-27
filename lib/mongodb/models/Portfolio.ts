import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPortfolio extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    description?: string
    imageUrl?: string
    projectUrl?: string
    category?: string
    technologies: string[]
    isFeatured: boolean
    isPublished: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

const PortfolioSchema = new Schema<IPortfolio>(
    {
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        projectUrl: {
            type: String,
        },
        category: {
            type: String,
        },
        technologies: {
            type: [String],
            default: [],
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

PortfolioSchema.index({ isPublished: 1 })
PortfolioSchema.index({ isFeatured: 1 })
PortfolioSchema.index({ displayOrder: 1 })

export const Portfolio: Model<IPortfolio> =
    mongoose.models.Portfolio ||
    mongoose.model<IPortfolio>('Portfolio', PortfolioSchema)

export default Portfolio
