import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProjectCategory extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    slug: string
    description?: string
    color?: string
    iconName?: string
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

const ProjectCategorySchema = new Schema<IProjectCategory>(
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
        description: {
            type: String,
        },
        color: {
            type: String,
            default: '#3b82f6', // Default blue-500
        },
        iconName: {
            type: String,
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

// Index


export const ProjectCategory: Model<IProjectCategory> =
    mongoose.models.ProjectCategory ||
    mongoose.model<IProjectCategory>('ProjectCategory', ProjectCategorySchema)

export default ProjectCategory
