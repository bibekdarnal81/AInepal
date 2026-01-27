import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPaymentMethod extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    type: 'esewa' | 'khalti' | 'bank_transfer'
    qr_image_url?: string
    account_name: string
    account_number: string
    bank_name?: string
    instructions?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['esewa', 'khalti', 'bank_transfer'],
            required: true,
        },
        qr_image_url: {
            type: String,
        },
        account_name: {
            type: String,
            required: true,
        },
        account_number: {
            type: String,
            required: true,
        },
        bank_name: {
            type: String,
        },
        instructions: {
            type: String,
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

export const PaymentMethod: Model<IPaymentMethod> =
    mongoose.models.PaymentMethod ||
    mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema)

export default PaymentMethod
