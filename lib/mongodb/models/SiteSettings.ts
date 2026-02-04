import mongoose, { Schema, Document, Model } from 'mongoose'
import { ISidebarItem } from '@/lib/types/mongodb'

export interface ISiteSettings extends Document {
    _id: mongoose.Types.ObjectId
    key: string
    sidebarItems: ISidebarItem[]
    payment?: {
        esewa: {
            merchantId: string
            secret: string
            environment: 'test' | 'live'
            enabled: boolean
        }
    }
    email?: {
        resendApiKey: string
        fromName: string
        fromEmail: string
    }
    updatedAt: Date
    createdAt: Date
}

const SidebarItemSchema = new Schema<ISidebarItem>(
    {
        key: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        href: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
)

const SiteSettingsSchema = new Schema<ISiteSettings>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: 'main',
        },
        sidebarItems: {
            type: [SidebarItemSchema],
            default: [
                { key: 'chat', label: 'Chat', href: '/chat', icon: 'MessageSquare', visible: true, order: 0 },
                { key: 'image', label: 'Image', href: '/image', icon: 'Image', visible: true, order: 1 },
                { key: 'video', label: 'Video', href: '/video', icon: 'Video', visible: true, order: 2 },
                { key: 'audio', label: 'Audio', href: '/audio', icon: 'Headphones', visible: true, order: 3 },
            ],
        },
    },
    {
        timestamps: true,
    }
)

// Add Payment Schema manually to the schema object since we are modifying an existing schema definition block
SiteSettingsSchema.add({
    payment: {
        esewa: {
            merchantId: { type: String, default: '' },
            secret: { type: String, default: '' },
            environment: { type: String, enum: ['test', 'live'], default: 'test' },
            enabled: { type: Boolean, default: false }
        }
    },
    email: {
        resendApiKey: { type: String, default: '' },
        fromName: { type: String, default: 'AINepal' },
        fromEmail: { type: String, default: 'onboarding@resend.dev' }
    }
})

// Prevent Mongoose model compilation errors in development
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.SiteSettings
}

export const SiteSettings: Model<ISiteSettings> =
    mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)

export default SiteSettings
