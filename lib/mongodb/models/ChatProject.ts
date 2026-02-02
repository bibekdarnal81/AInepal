import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatProject extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    name: string
    createdAt: Date
    updatedAt: Date
}

const ChatProjectSchema = new Schema<IChatProject>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
ChatProjectSchema.index({ userId: 1, updatedAt: -1 })

export const ChatProject: Model<IChatProject> =
    mongoose.models.ChatProject ||
    mongoose.model<IChatProject>('ChatProject', ChatProjectSchema)

export default ChatProject
