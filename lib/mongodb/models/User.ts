import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    email: string
    password: string
    displayName?: string
    avatarUrl?: string
    phone?: string
    bio?: string
    isAdmin: boolean
    isSuspended: boolean
    membershipId?: mongoose.Types.ObjectId | null
    membershipStatus?: 'none' | 'active' | 'trialing' | 'canceled' | 'expired'
    membershipExpiresAt?: Date | null
    credits: number
    advancedCredits: number
    emailVerified?: Date | null
    verificationToken?: string
    verificationTokenExpires?: Date
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: false,
        },
        displayName: {
            type: String,
            trim: true,
        },
        avatarUrl: {
            type: String,
        },
        phone: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        credits: {
            type: Number,
            default: 50,
        },
        advancedCredits: {
            type: Number,
            default: 0,
        },
        membershipId: {
            type: Schema.Types.ObjectId,
            ref: 'Membership',
        },
        membershipStatus: {
            type: String,
            enum: ['none', 'active', 'trialing', 'canceled', 'expired'],
            default: 'none',
        },
        membershipExpiresAt: {
            type: Date,
        },
        emailVerified: {
            type: Date,
        },
        verificationToken: {
            type: String,
        },
        verificationTokenExpires: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes

UserSchema.index({ isAdmin: 1 })
UserSchema.index({ membershipStatus: 1 })
UserSchema.index({ membershipExpiresAt: 1 })

// Force recompilation of model if it already exists to ensure schema updates apply
if (mongoose.models.User) {
    delete mongoose.models.User
}

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
