import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    description?: string
    thumbnailUrl?: string
    liveUrl?: string
    repoUrl?: string
    price?: number
    currency: string
    categoryId?: mongoose.Types.ObjectId
    technologies: string[]
    features: string[]
    isPublished: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
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
        thumbnailUrl: {
            type: String,
        },
        liveUrl: {
            type: String,
        },
        repoUrl: {
            type: String,
        },
        price: {
            type: Number,
        },
        currency: {
            type: String,
            default: 'NPR',
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'ProjectCategory',
        },
        technologies: {
            type: [String],
            default: [],
        },
        features: {
            type: [String],
            default: [],
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

ProjectSchema.index({ isPublished: 1 })
ProjectSchema.index({ isFeatured: 1 })
ProjectSchema.index({ categoryId: 1 })
ProjectSchema.index({ displayOrder: 1 })

export const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

export default Project
