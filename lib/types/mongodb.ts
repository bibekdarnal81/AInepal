import type mongoose from 'mongoose'

export interface ISidebarItem {
    key: string
    label: string
    href: string
    icon: string
    visible: boolean
    order: number
}

export interface ISiteSettings {
    _id: string | mongoose.Types.ObjectId
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
    updatedAt: Date
    createdAt: Date
}

export interface IClass {
    _id: string | mongoose.Types.ObjectId
    title: string
    slug: string
    description?: string
    instructor?: string
    thumbnailUrl?: string
    price: number
    currency: string
    duration?: string
    schedule?: string
    maxStudents?: number
    level?: string
    startDate?: Date
    summary?: string
    isActive: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}
