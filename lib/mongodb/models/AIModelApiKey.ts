import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAIModelApiKey extends Document {
    _id: mongoose.Types.ObjectId
    provider: string
    encryptedApiKey: string
    encryptionIv: string
    lastUsedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const AIModelApiKeySchema = new Schema<IAIModelApiKey>(
    {
        provider: {
            type: String,
            required: true,
            unique: true,
        },
        encryptedApiKey: {
            type: String,
            required: true,
        },
        encryptionIv: {
            type: String,
            required: true,
        },
        lastUsedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Index


export const AIModelApiKey: Model<IAIModelApiKey> =
    mongoose.models.AIModelApiKey ||
    mongoose.model<IAIModelApiKey>('AIModelApiKey', AIModelApiKeySchema)

export default AIModelApiKey
