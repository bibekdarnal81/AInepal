import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAITool extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    slug: string
    description?: string
    category?: string
    iconName?: string
    prompt?: string
    modelId?: mongoose.Types.ObjectId
    isActive: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

const AIToolSchema = new Schema<IAITool>(
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
        category: {
            type: String,
        },
        iconName: {
            type: String,
        },
        prompt: {
            type: String,
        },
        modelId: {
            type: Schema.Types.ObjectId,
            ref: 'AIModel',
        },
        isActive: {
            type: Boolean,
            default: true,
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

AIToolSchema.index({ isActive: 1 })
AIToolSchema.index({ category: 1 })

export const AITool: Model<IAITool> =
    mongoose.models.AITool || mongoose.model<IAITool>('AITool', AIToolSchema)

export default AITool
