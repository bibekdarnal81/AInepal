import mongoose, { Schema, Document, Model } from 'mongoose'

export type DomainStatus = 'pending' | 'active' | 'expired' | 'cancelled'

export interface IDomain extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    domainName: string
    tld: string
    registrar: string
    price: number
    status: DomainStatus
    registeredAt?: Date
    expiresAt?: Date
    autoRenew: boolean
    bundleId?: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const DomainSchema = new Schema<IDomain>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        domainName: {
            type: String,
            required: true,
            unique: true,
        },
        tld: {
            type: String,
            required: true,
        },
        registrar: {
            type: String,
            default: 'AINepal',
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'expired', 'cancelled'],
            default: 'pending',
        },
        registeredAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
        },
        autoRenew: {
            type: Boolean,
            default: true,
        },
        bundleId: {
            type: Schema.Types.ObjectId,
            ref: 'BundleOffer',
        },
    },
    {
        timestamps: true,
    }
)

// Indexes
DomainSchema.index({ userId: 1 })

DomainSchema.index({ status: 1 })

export const Domain: Model<IDomain> =
    mongoose.models.Domain || mongoose.model<IDomain>('Domain', DomainSchema)

export default Domain
