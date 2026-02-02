import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatHistoryMessage {
    role: 'user' | 'assistant'
    content: string
    modelId?: string
    modelName?: string
    timestamp: Date
}

export interface IUserChatSession extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    title: string
    messages: IChatHistoryMessage[]
    modelId?: string
    projectId?: mongoose.Types.ObjectId
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const ChatHistoryMessageSchema = new Schema<IChatHistoryMessage>(
    {
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        modelId: String,
        modelName: String,
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
)

const UserChatSessionSchema = new Schema<IUserChatSession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            default: 'New Chat',
        },
        messages: [ChatHistoryMessageSchema],
        modelId: String,
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'ChatProject',
            index: true,
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
UserChatSessionSchema.index({ userId: 1, updatedAt: -1 })
UserChatSessionSchema.index({ userId: 1, isActive: 1 })

export const UserChatSession: Model<IUserChatSession> =
    mongoose.models.UserChatSession ||
    mongoose.model<IUserChatSession>('UserChatSession', UserChatSessionSchema)

export default UserChatSession
