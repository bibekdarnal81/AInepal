import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITemplate extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    summary?: string
    description?: string
    imageUrl?: string
    demoUrl?: string
    category?: string
    tags: string[]
    techStack: string[]
    price: number
    currency: string
    isPublished: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

const TemplateSchema = new Schema<ITemplate>(
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
        summary: {
            type: String,
        },
        description: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        demoUrl: {
            type: String,
        },
        category: {
            type: String,
        },
        tags: {
            type: [String],
            default: [],
        },
        techStack: {
            type: [String],
            default: [],
        },
        price: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'NPR',
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
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

TemplateSchema.index({ isPublished: 1 })
TemplateSchema.index({ isFeatured: 1 })
TemplateSchema.index({ displayOrder: 1 })

export const Template: Model<ITemplate> =
    mongoose.models.Template ||
    mongoose.model<ITemplate>('Template', TemplateSchema)

export default Template
