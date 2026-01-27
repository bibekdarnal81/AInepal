import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import mongoose from 'mongoose'
import Membership from '../lib/mongodb/models/Membership'

const MONGODB_URI = process.env.MONGODB_URI || ''

const proMembershipData = {
    name: 'Pro',
    slug: 'pro',
    description: 'Great value for individuals looking to boost productivity',
    price: 9.9,
    priceMonthly: 9.9,
    priceYearly: 99.0,
    yearlyDiscountPercent: 17,
    discount: 0,
    currency: 'USD',
    durationDays: 30,
    features: [
        'Advanced model-driven smart writing, translation, summary, and ChatPDF',
        '1,500 Advanced Credits',
    ],
    featureCategories: [
        {
            categoryName: '5,000 basic model queries monthly',
            items: [
                { icon: 'Bot', name: 'Claude 4.5 Haiku' },
                { icon: 'Bot', name: 'Gemini 3 Flash' },
                { icon: 'Bot', name: 'GPT-4.1 mini' },
            ],
        },
        {
            categoryName: '200 advanced model queries monthly',
            items: [
                { icon: 'Sparkles', name: 'GPT-5.2' },
                { icon: 'Sparkles', name: 'Claude 4.5 Sonnet' },
                { icon: 'Sparkles', name: 'Gemini 3 Pro' },
            ],
        },
        {
            categoryName: 'Image and video generation',
            items: [
                { icon: 'Image', name: 'Nano Banana Pro' },
                { icon: 'Video', name: 'Sora 2' },
            ],
        },
        {
            categoryName: 'AI Agent',
            items: [
                { icon: 'Globe', name: 'Browser Operator' },
                { icon: 'Search', name: 'Deep Research' },
                { icon: 'Presentation', name: 'Create Slides' },
            ],
        },
    ],
    advancedCredits: 1500,
    appIntegrationIcons: ['Gmail', 'Outlook', 'Facebook', 'X', 'LinkedIn'],
    platformIcons: ['Chrome', 'Windows', 'Apple', 'Android', 'VSCode'],
    badgeText: '17%',
    iconName: 'Star',
    isActive: true,
    sortOrder: 3,
}

async function updateProMembership() {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB')

        console.log('Updating Pro membership...')
        await Membership.findOneAndUpdate(
            { slug: 'pro' },
            proMembershipData,
            { upsert: true, new: true }
        )

        console.log('\n✅ Successfully updated Pro membership!')
        console.log('Features:')
        console.log('  - 5,000 basic model queries monthly (Claude 4.5 Haiku, Gemini 3 Flash, GPT-4.1 mini)')
        console.log('  - 200 advanced model queries monthly (GPT-5.2, Claude 4.5 Sonnet, Gemini 3 Pro)')
        console.log('  - Image and video generation (Nano Banana Pro, Sora 2)')
        console.log('  - AI Agent (Browser Operator, Deep Research, Create Slides)')
        console.log('  - Application Integration (Gmail, Outlook, Facebook, X, LinkedIn)')
        console.log('  - Cross-platform AI assistant (Chrome, Windows, iOS/macOS, Android, VS Code)')
    } catch (error) {
        console.error('Error updating membership:', error)
    } finally {
        await mongoose.disconnect()
        console.log('\nDisconnected from MongoDB')
    }
}

updateProMembership()
