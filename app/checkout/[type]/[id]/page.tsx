import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import {
    HostingPlan,
    Service,
    Project,
    BundleOffer,
    Class,
    PaymentMethod,
    Domain,
    Membership,
    User
} from '@/lib/mongodb/models'
import mongoose from 'mongoose'
import CheckoutClient from './checkout-client'

interface PageProps {
    params: Promise<{
        type: string
        id: string
    }>
    searchParams: Promise<{
        billing?: string
        domain?: string
    }>
}

type CheckoutItem = {
    id: string
    name: string
    price: number
    currency?: string
    description?: string
    price_yearly?: number
}

async function getPaymentMethods() {
    await dbConnect()
    const methods = await PaymentMethod.find({ isActive: true })
        .sort({ createdAt: 1 })
        .lean()

    return methods.map(m => ({
        _id: m._id.toString(),
        name: m.name,
        type: m.type,
        qr_image_url: m.qr_image_url,
        account_name: m.account_name,
        account_number: m.account_number,
        bank_name: m.bank_name,
        instructions: m.instructions
    }))
}

async function createNewDomain(domainName: string) {
    if (!domainName) return null
    return {
        id: 'new-domain',
        name: domainName,
        price: 1500, // Default or fetch from config
        currency: 'NPR',
        description: 'Domain Registration'
    }
}

async function getItem(type: string, id: string, searchParams: { domain?: string }) {
    await dbConnect()

    let item: CheckoutItem | null = null

    if (type === 'hosting') {
        const data = await HostingPlan.findOne({ slug: id, isActive: true }).lean()
        if (data) item = {
            id: data._id.toString(),
            name: data.name,
            price: data.price,
            price_yearly: data.yearlyPrice,
            description: `${data.storageGb}GB Storage, ${data.bandwidthText} Bandwidth`
        }
    } else if (type === 'services') {
        const data = await Service.findById(id).lean()
        if (data) item = { id: data._id.toString(), name: data.title, price: data.price, currency: data.currency }
    } else if (type === 'projects') {
        // Try slug first, then ID
        let data = await Project.findOne({ slug: id }).lean()
        if (!data && mongoose.Types.ObjectId.isValid(id)) {
            data = await Project.findById(id).lean()
        }
        if (data) item = { id: data._id.toString(), name: data.title, price: data.price || 0, currency: data.currency || 'NPR' }
    } else if (type === 'domains') {
        const domainName = searchParams.domain
        if (domainName) {
            item = await createNewDomain(domainName)
        } else {
            // For renewals of existing domains?
            // Or typically we checkout a domain by ID if already in DB but pending?
            // Let's search by ID
            try {
                const data = await Domain.findById(id).lean()
                if (data) item = { id: data._id.toString(), name: data.domainName, price: data.price }
                else {
                    // Fallback: if ID is just "new" or similar?
                    // The client code handled 'domains' with param logic.
                    // If no domain param, maybe ID is the domain name?
                    // Original code: if domain param exists, use it. Else fetch by ID.
                }
            } catch (e) {
                // If ID is not valid ObjectId, maybe it's a domain name?
                // Depending on routing.
            }
        }
    } else if (type === 'bundles') {
        const data = await BundleOffer.findById(id).lean()
        if (data) {
            item = {
                id: data._id.toString(),
                name: data.name,
                price: data.price,
                currency: 'NPR',
                description: `Bundle Offer: ${data.name}`
            }
        }
    } else if (type === 'classes') {
        const data = await Class.findOne({ slug: id, isActive: true }).lean()
        if (data) {
            item = {
                id: data._id.toString(),
                name: data.title,
                price: data.price || 0,
                currency: data.currency || 'NPR',
                description: data.summary || ''
            }
        }
    } else if (type === 'memberships') {
        let data = await Membership.findOne({ slug: id, isActive: true }).lean()
        if (!data && mongoose.Types.ObjectId.isValid(id)) {
            data = await Membership.findById(id).lean()
        }
        if (data) {
            const monthly = data.priceMonthly ?? data.price ?? 0
            const yearly = data.priceYearly ?? (data.yearlyDiscountPercent ? monthly * 12 * (1 - data.yearlyDiscountPercent / 100) : monthly * 12)
            item = {
                id: data._id.toString(),
                name: data.name,
                price: monthly,
                price_yearly: yearly,
                currency: data.currency || 'USD',
                description: data.description || `${data.durationDays} day membership`
            }
        }
    }

    return item
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams
    const { type, id } = resolvedParams

    const [item, paymentMethods, session] = await Promise.all([
        getItem(type, id, resolvedSearchParams),
        getPaymentMethods(),
        getServerSession(authOptions)
    ])

    if (!item) {
        notFound()
    }

    // Membership Restrictions
    if (type === 'memberships' && session?.user?.id) {
        // Fetch fresh user data to be sure
        const user = await User.findById(session.user.id)
            .select('membershipStatus advancedCredits membershipId')
            .populate('membershipId')
            .lean() as { membershipStatus?: string; advancedCredits?: number; membershipId?: { slug: string; price: number } | null } | null

        if (user) {
            // Restriction 1: No Doubles (unless current plan is Free)
            const isFreePlan = user.membershipId?.slug === 'free' || user.membershipId?.price === 0

            if (user.membershipStatus === 'active' && !isFreePlan) {
                return (
                    <div className="min-h-screen bg-gray-50 dark:bg-[#05070b] flex flex-col pt-24 px-4">
                        <div className="max-w-md mx-auto w-full bg-white dark:bg-[#0f1117] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-8 text-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Active Membership Found</h1>
                            <p className="text-gray-600 dark:text-slate-400 mb-8">
                                You already have an active premium membership. You cannot purchase another membership while one is active.
                            </p>
                            <a
                                href="/dashboard/billing"
                                className="block w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                            >
                                Manage Membership
                            </a>
                        </div>
                    </div>
                )
            }

            // Restriction 2: AdvancedCredit Requirement
            // Assuming requirement is > 0. If there's a specific amount, update here.
            if ((user.advancedCredits || 0) <= 0) {
                return (
                    <div className="min-h-screen bg-gray-50 dark:bg-[#05070b] flex flex-col pt-24 px-4">
                        <div className="max-w-md mx-auto w-full bg-white dark:bg-[#0f1117] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Insufficient Credits</h1>
                            <p className="text-gray-600 dark:text-slate-400 mb-8">
                                You need to have Advanced Credits to purchase this membership.
                            </p>
                            <a
                                href="/dashboard/credits"
                                className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Get Credits
                            </a>
                        </div>
                    </div>
                )
            }
        }
    }

    return (
        <CheckoutClient
            item={item}
            type={type}
            paymentMethods={paymentMethods}
            initialBillingCycle={resolvedSearchParams.billing === 'monthly' ? 'monthly' : 'yearly'}
            initialDomainName={resolvedSearchParams.domain || ''}
        />
    )
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
