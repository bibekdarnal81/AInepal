import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAIModel extends Document {
    _id: mongoose.Types.ObjectId
    provider: string
    modelName: string
    displayName: string
    description?: string
    image?: string
    apiEndpoint?: string
    modelId: string
    supportsStreaming: boolean
    supportsFunctions: boolean
    supportsVision: boolean
    supportsImageGeneration: boolean
    supportsVideoGeneration: boolean
    defaultTemperature: number
    defaultMaxTokens: number
    defaultTopP: number
    pricePer1kInput?: number
    pricePer1kOutput?: number
    currency: string
    isActive: boolean
    disabled: boolean
    adminMessage?: string
    displayOrder: number
    lastTestedAt?: Date
    connectionStatus?: string
    createdAt: Date
    updatedAt: Date
}

const AIModelSchema = new Schema<IAIModel>(
    {
        provider: {
            type: String,
            required: true,
        },
        modelName: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
        apiEndpoint: {
            type: String,
        },
        modelId: {
            type: String,
            required: true,
        },
        supportsStreaming: {
            type: Boolean,
            default: true,
        },
        supportsFunctions: {
            type: Boolean,
            default: false,
        },
        supportsVision: {
            type: Boolean,
            default: false,
        },
        supportsImageGeneration: {
            type: Boolean,
            default: false,
        },
        supportsVideoGeneration: {
            type: Boolean,
            default: false,
        },
        defaultTemperature: {
            type: Number,
            default: 0.7,
        },
        defaultMaxTokens: {
            type: Number,
            default: 2000,
        },
        defaultTopP: {
            type: Number,
            default: 1.0,
        },
        pricePer1kInput: {
            type: Number,
        },
        pricePer1kOutput: {
            type: Number,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        adminMessage: {
            type: String,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        lastTestedAt: {
            type: Date,
        },
        connectionStatus: {
            type: String,
            enum: ['connected', 'failed', 'not_tested'],
            default: 'not_tested',
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
AIModelSchema.index({ provider: 1, modelName: 1 }, { unique: true })

AIModelSchema.index({ isActive: 1 })
AIModelSchema.index({ displayOrder: 1 })

// Prevent Mongoose model compilation errors in development
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.AIModel
}

export const AIModel: Model<IAIModel> =
    mongoose.models.AIModel || mongoose.model<IAIModel>('AIModel', AIModelSchema)

export default AIModel
