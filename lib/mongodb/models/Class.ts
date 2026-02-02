import mongoose, { Schema, Document, Model } from 'mongoose'
import { IClass as IClassBase } from '@/lib/types/mongodb'

export interface IClass extends IClassBase, Document {
    _id: mongoose.Types.ObjectId
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
