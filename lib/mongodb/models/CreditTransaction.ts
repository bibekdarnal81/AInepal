import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICreditTransaction extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    amount: number
    type: 'purchase' | 'generation' | 'refund' | 'admin_adjustment' | 'bonus'
    description: string
    metadata?: Record<string, unknown>
    createdAt: Date
    updatedAt: Date
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['purchase', 'generation', 'refund', 'admin_adjustment', 'bonus'],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
CreditTransactionSchema.index({ userId: 1 })
CreditTransactionSchema.index({ type: 1 })
CreditTransactionSchema.index({ createdAt: -1 })

export const CreditTransaction: Model<ICreditTransaction> =
    mongoose.models.CreditTransaction || mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema)

export default CreditTransaction
