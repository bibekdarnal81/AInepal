import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IGuestChatSession extends Document {
    _id: mongoose.Types.ObjectId
    sessionToken: string
    guestName?: string
    guestEmail?: string
    isActive: boolean
    lastActivityAt: Date
    createdAt: Date
    updatedAt: Date
}

const GuestChatSessionSchema = new Schema<IGuestChatSession>(
    {
        sessionToken: {
            type: String,
            required: true,
            unique: true,
        },
        guestName: {
            type: String,
            trim: true,
        },
        guestEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastActivityAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes

GuestChatSessionSchema.index({ isActive: 1 })
GuestChatSessionSchema.index({ lastActivityAt: -1 })

export const GuestChatSession: Model<IGuestChatSession> =
    mongoose.models.GuestChatSession ||
    mongoose.model<IGuestChatSession>('GuestChatSession', GuestChatSessionSchema)

export default GuestChatSession
