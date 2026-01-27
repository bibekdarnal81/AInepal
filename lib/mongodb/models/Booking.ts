import mongoose, { Schema, Document, Model } from 'mongoose'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface IBooking extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    serviceType: string
    serviceName: string
    bookingDate: Date
    bookingTime: string
    duration: number
    status: BookingStatus
    notes?: string
    chatMessageId?: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        serviceType: {
            type: String,
            required: true,
        },
        serviceName: {
            type: String,
            required: true,
        },
        bookingDate: {
            type: Date,
            required: true,
        },
        bookingTime: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            default: 60,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
        },
        notes: {
            type: String,
        },
        chatMessageId: {
            type: Schema.Types.ObjectId,
            ref: 'ChatMessage',
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
BookingSchema.index({ userId: 1 })
BookingSchema.index({ status: 1 })
BookingSchema.index({ bookingDate: 1 })

export const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)

export default Booking
