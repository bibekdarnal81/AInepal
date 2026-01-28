import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserApiKey extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    name: string
    key: string
    lastUsedAt?: Date
    expiresAt?: Date
    allowedDomains?: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const UserApiKeySchema = new Schema<IUserApiKey>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        key: {
            type: String,
            required: true,
            unique: true,
        },
        lastUsedAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
        },
        allowedDomains: {
            type: [String],
            default: []
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

UserApiKeySchema.index({ userId: 1 })

// Force recompilation
if (mongoose.models.UserApiKey) {
    delete mongoose.models.UserApiKey
}

export const UserApiKey: Model<IUserApiKey> =
    mongoose.models.UserApiKey || mongoose.model<IUserApiKey>('UserApiKey', UserApiKeySchema)

export default UserApiKey
