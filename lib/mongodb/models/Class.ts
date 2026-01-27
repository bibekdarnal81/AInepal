import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClass extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    description?: string
    instructor?: string
    thumbnailUrl?: string
    price: number
    currency: string
    duration?: string
    schedule?: string
    maxStudents?: number
    level?: string
    startDate?: Date
    summary?: string
    isActive: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

const ClassSchema = new Schema<IClass>(
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
        instructor: {
            type: String,
        },
        thumbnailUrl: {
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
        duration: {
            type: String,
        },
        schedule: {
            type: String,
        },
        maxStudents: {
            type: Number,
        },
        level: {
            type: String,
        },
        startDate: {
            type: Date,
        },
        summary: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
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

ClassSchema.index({ isActive: 1 })
ClassSchema.index({ isFeatured: 1 })
ClassSchema.index({ displayOrder: 1 })

export const Class: Model<IClass> =
    mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema)

export default Class
