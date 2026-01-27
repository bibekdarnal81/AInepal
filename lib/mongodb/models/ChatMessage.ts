import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatMessage extends Document {
    _id: mongoose.Types.ObjectId
    userId?: mongoose.Types.ObjectId
    guestSessionId?: mongoose.Types.ObjectId
    message: string
    isAdmin: boolean
    isRead: boolean
    imageUrl?: string
    createdAt: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        guestSessionId: {
            type: Schema.Types.ObjectId,
            ref: 'GuestChatSession',
        },
        message: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        imageUrl: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
)

// Indexes
ChatMessageSchema.index({ userId: 1 })
ChatMessageSchema.index({ guestSessionId: 1 })
ChatMessageSchema.index({ createdAt: -1 })
ChatMessageSchema.index({ isRead: 1 })

export const ChatMessage: Model<IChatMessage> =
    mongoose.models.ChatMessage ||
    mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)

export default ChatMessage
