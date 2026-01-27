import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICareer extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    description?: string
    requirements?: string
    location?: string
    employmentType?: string
    salary?: string
    department?: string
    experience?: string
    applyUrl?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const CareerSchema = new Schema<ICareer>(
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
        requirements: {
            type: String,
        },
        location: {
            type: String,
        },
        employmentType: {
            type: String,
        },
        salary: {
            type: String,
        },
        department: {
            type: String,
        },
        experience: {
            type: String,
        },
        applyUrl: {
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

// Indexes

CareerSchema.index({ isActive: 1 })

export const Career: Model<ICareer> =
    mongoose.models.Career || mongoose.model<ICareer>('Career', CareerSchema)

export default Career
