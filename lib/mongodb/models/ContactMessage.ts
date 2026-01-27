import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContactMessage extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    email: string
    phone?: string
    subject?: string
    message: string
    company?: string
    budget?: string
    services: string[]
    website?: string
    contactMethod: string
    isRead: boolean
    createdAt: Date
}

const ContactMessageSchema = new Schema<IContactMessage>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            trim: true,
        },
        budget: {
            type: String,
            trim: true,
        },
        services: {
            type: [String],
            default: [],
        },
        website: {
            type: String,
            trim: true,
        },
        contactMethod: {
            type: String,
            default: 'email',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
)

// Indexes
ContactMessageSchema.index({ isRead: 1 })
ContactMessageSchema.index({ createdAt: -1 })

export const ContactMessage: Model<IContactMessage> =
    mongoose.models.ContactMessage ||
    mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema)

export default ContactMessage
