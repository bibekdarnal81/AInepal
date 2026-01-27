import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import mongoose from 'mongoose'
import Membership from '../lib/mongodb/models/Membership'

const MONGODB_URI = process.env.MONGODB_URI || ''

const demoMemberships = [
    {
        name: 'Ultra',
        slug: 'ultra',
        description: 'Ultimate plan for power users with unlimited access to all features',
        price: 99.9,
        priceMonthly: 99.9,
        priceYearly: 995.0,
        yearlyDiscountPercent: 17,
        currency: 'USD',
        durationDays: 30,
        features: [],
        featureCategories: [
            {
                categoryName: 'Unlimited access to basic models',
                items: [
                    { icon: 'Bot', name: 'Claude 4.5 Haiku' },
                    { icon: 'Bot', name: 'Gemini 3 Flash' },
                    { icon: 'Bot', name: 'GPT-4.1 mini' },
                ],
            },
            {
                categoryName: 'Unlimited access to advanced models',
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
        advancedCredits: 20000,
        appIntegrationIcons: ['Gmail', 'Slack', 'Facebook', 'X', 'Notion'],
        platformIcons: ['Chrome', 'Windows', 'Apple', 'Android', 'Linux'],
        badgeText: '17%',
        iconName: 'Crown',
        isActive: true,
        sortOrder: 1,
    },
    {
        name: 'Max',
        slug: 'max',
        description: 'Perfect for professionals who need advanced AI capabilities',
        price: 24.9,
        priceMonthly: 24.9,
        priceYearly: 149.0,
        yearlyDiscountPercent: 50,
        currency: 'USD',
        durationDays: 30,
        features: [],
        featureCategories: [
            {
                categoryName: 'Unlimited access to basic models',
                items: [
                    { icon: 'Bot', name: 'Claude 4.5 Haiku' },
                    { icon: 'Bot', name: 'Gemini 3 Flash' },
                    { icon: 'Bot', name: 'GPT-4.1 mini' },
                ],
            },
            {
                categoryName: 'Unlimited access to advanced models',
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
        advancedCredits: 4500,
        appIntegrationIcons: ['Gmail', 'Slack', 'Facebook', 'X', 'Notion'],
        platformIcons: ['Chrome', 'Windows', 'Apple', 'Android', 'Linux'],
        badgeText: '50%',
        iconName: 'Zap',
        isActive: true,
        sortOrder: 2,
    },
    {
        name: 'Pro',
        slug: 'pro',
        description: 'Great value for individuals looking to boost productivity',
        price: 9.9,
        priceMonthly: 9.9,
        priceYearly: 99.0,
        yearlyDiscountPercent: 17,
        currency: 'USD',
        durationDays: 30,
        features: [],
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
        appIntegrationIcons: ['Gmail', 'Slack', 'Facebook', 'X', 'Notion'],
        platformIcons: ['Chrome', 'Windows', 'Apple', 'Android', 'Linux'],
        badgeText: '17%',
        iconName: 'Star',
        isActive: true,
        sortOrder: 3,
    },
    {
        name: 'Free',
        slug: 'free',
        description: 'Get started with basic AI capabilities at no cost',
        price: 0,
        priceMonthly: 0,
        priceYearly: 0,
        yearlyDiscountPercent: 0,
        currency: 'USD',
        durationDays: 365,
        features: [
            '40 accesses to basic models daily',
            'Limited trial for image/video generation',
            'Basic model-driven smart writing, translation, and summary',
            'Limited trial for ChatPDF',
            'Limited trial for AI Agent',
        ],
        featureCategories: [
            {
                categoryName: '40 accesses to basic models daily',
                items: [
                    { icon: 'Bot', name: 'Claude 4.5 Haiku' },
                    { icon: 'Bot', name: 'Gemini 3 Flash' },
                    { icon: 'Bot', name: 'GPT-4.1 mini' },
                ],
            },
        ],
        advancedCredits: 0,
        appIntegrationIcons: ['Gmail', 'Slack', 'Facebook', 'X'],
        platformIcons: ['Chrome', 'Windows', 'Apple', 'Android', 'Linux'],
        badgeText: '',
        iconName: 'Gift',
        isActive: true,
        sortOrder: 4,
    },
]

async function seedMemberships() {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB')

        // Clear existing memberships
        console.log('Clearing existing memberships...')
        await Membership.deleteMany({})

        // Insert demo memberships
        console.log('Inserting demo memberships...')
        for (const membership of demoMemberships) {
            await Membership.create(membership)
            console.log(`Created: ${membership.name}`)
        }

        console.log('\n✅ Successfully seeded 4 demo memberships!')
        console.log('   - Ultra ($99.9/month, $995/year - 17% off)')
        console.log('   - Max ($24.9/month, $149/year - 50% off)')
        console.log('   - Pro ($9.9/month, $99/year - 17% off)')
        console.log('   - Free ($0)')
    } catch (error) {
        console.error('Error seeding memberships:', error)
    } finally {
        await mongoose.disconnect()
        console.log('\nDisconnected from MongoDB')
    }
}

seedMemberships()
