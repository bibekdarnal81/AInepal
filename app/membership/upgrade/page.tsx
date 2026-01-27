import Link from 'next/link'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb/client'
import { Membership, User } from '@/lib/mongodb/models'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import MembershipPlans from './membership-plans'

export const revalidate = 60

export default async function MembershipUpgradePage() {
    await dbConnect()
    const session = await getServerSession(authOptions)
    let currentMembershipId: string | null = null
    if (session?.user?.id) {
        const user = await User.findById(session.user.id).select('membershipId').lean()
        if (user?.membershipId) currentMembershipId = user.membershipId.toString()
    }
    const memberships = await Membership.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean()
    const typedMemberships = memberships as Array<{
        _id: string
        name: string
        slug: string
        description?: string
        currency?: string
        durationDays?: number
        price?: number
        priceMonthly?: number | null
        priceYearly?: number | null
        yearlyDiscountPercent?: number | null
        discount?: number | null
        features?: string[]
        featureCategories?: Array<{ categoryName: string; items?: Array<{ name: string; icon?: string }> }>
        advancedCredits?: number
        appIntegrationIcons?: string[]
        platformIcons?: string[]
        badgeText?: string
        iconName?: string | null
        imageUrl?: string | null
        additionalSections?: Array<{
            heading?: string
            title?: string
            text?: string
            imageUrl?: string
            videoUrl?: string
            quote?: string
            embedHtml?: string
        }>
    }>
    const hasMemberships = typedMemberships.length > 0
    const hasAdditionalSections = typedMemberships.some((m) => (m.additionalSections || []).length > 0)
    const planData = typedMemberships.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        slug: m.slug,
        description: m.description,
        currency: m.currency || 'USD',
        durationDays: m.durationDays || 30,
        price: m.price || 0,
        priceMonthly: m.priceMonthly ?? null,
        priceYearly: m.priceYearly ?? null,
        yearlyDiscountPercent: m.yearlyDiscountPercent ?? null,
        discount: m.discount ?? null,
        features: m.features || [],
        featureCategories: (m.featureCategories || []).map((cat) => ({
            categoryName: cat.categoryName,
            items: (cat.items || []).map((item) => ({
                name: item.name,
                icon: item.icon,
            })),
        })),
        advancedCredits: m.advancedCredits,
        appIntegrationIcons: m.appIntegrationIcons || [],
        platformIcons: m.platformIcons || [],
        badgeText: m.badgeText,
        iconName: m.iconName || null,
        imageUrl: m.imageUrl || null,
        additionalSections: (m.additionalSections || []).map((section) => ({
            heading: section.heading,
            title: section.title,
            text: section.text,
            imageUrl: section.imageUrl,
            videoUrl: section.videoUrl,
            quote: section.quote,
            embedHtml: section.embedHtml,
        })),
    }))

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#05070b] text-gray-900 dark:text-slate-200 selection:bg-indigo-500/30">
            <Header />
            <main className="pt-24 pb-20">
                <section className="relative overflow-hidden px-4 pb-20">
                    <div className="absolute inset-0 bg-white dark:bg-[radial-gradient(circle_at_top,_#1a2437,_#0b0f17_55%,_#05070b_100%)]" />
                    <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
                    <div className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl opacity-50" />

                    <div className="relative max-w-6xl mx-auto text-center pt-16 md:pt-24 mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-white/5 border border-emerald-100 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-widest shadow-sm dark:shadow-black/20 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            Upgrade Your Plan
                        </div>
                        <h1 className="mt-8 text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Unlock your full <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-200 dark:to-amber-500">potential</span>
                        </h1>
                        <p className="mt-6 text-base md:text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Choose the perfect plan to accelerate your workflow. Get access to advanced AI models, premium tools, and dedicated support.
                        </p>
                    </div>

                    <div className="relative max-w-[1400px] mx-auto">
                        {hasMemberships ? (
                            <MembershipPlans plans={planData} currentMembershipId={currentMembershipId} />
                        ) : (
                            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl p-12 text-center max-w-lg mx-auto shadow-sm">
                                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No plans available</h2>
                                <p className="text-gray-600 dark:text-slate-400">Current membership plans are being updated. Check back soon.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-4 py-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-200 dark:border-white/10 pb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Detailed Comparison</h2>
                                <p className="text-gray-600 dark:text-slate-400">Everything you need to know about our plans.</p>
                            </div>
                        </div>

                        {hasMemberships ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {typedMemberships.map((m) => (
                                    <div key={`${m._id.toString()}-features`} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f17] p-8 hover:bg-gray-50 dark:hover:bg-[#111620] transition-colors shadow-sm dark:shadow-none">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{m.name}</h3>
                                            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/5">
                                                {m.durationDays} days
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {(m.features || []).slice(0, 8).map((feature: string, idx: number) => (
                                                <div key={`${m._id}-${idx}-grid`} className="flex items-start gap-3 text-sm text-gray-600 dark:text-slate-400">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                    <span className="leading-relaxed">{feature}</span>
                                                </div>
                                            ))}
                                            {(m.features || []).length === 0 && (
                                                <p className="text-gray-500 dark:text-slate-500 italic text-sm">No additional details.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>

                {hasAdditionalSections && (
                    <section className="px-4 py-16 bg-gray-100 dark:bg-white/[0.02]">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-12 text-center">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Feature Deep Dive</h2>
                                <p className="text-gray-600 dark:text-slate-400 mt-2">Learn more about what enables your success.</p>
                            </div>
                            <div className="space-y-16">
                                {typedMemberships.map((m) => (
                                    (m.additionalSections || []).length > 0 ? (
                                        <div key={`${m._id.toString()}-extra`} className="space-y-6">
                                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
                                                {m.imageUrl ? (
                                                    <img src={m.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-white/10" />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-white">
                                                        {m.name?.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{m.name} <span className="text-gray-500 dark:text-slate-400 font-normal">Exclusives</span></h3>
                                                </div>
                                            </div>
                                            <div className="grid gap-8 md:grid-cols-2">
                                                {m.additionalSections.map((section, idx) => (
                                                    <div key={`${m._id}-${idx}-section`} className="group rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0f17] p-1 overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm">
                                                        <div className="bg-gray-50 dark:bg-[#131926] rounded-[22px] p-6 h-full flex flex-col">
                                                            {section.imageUrl && (
                                                                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/50 aspect-video">
                                                                    <img src={section.imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                                </div>
                                                            )}
                                                            {section.videoUrl && (
                                                                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/50 aspect-video">
                                                                    <video src={section.videoUrl} controls className="w-full h-full object-cover" />
                                                                </div>
                                                            )}

                                                            <div className="flex-1">
                                                                {(section.heading || section.title) && (
                                                                    <div className="mb-3">
                                                                        {section.heading && (
                                                                            <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">{section.heading}</p>
                                                                        )}
                                                                        {section.title && (
                                                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h4>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {section.text && (
                                                                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">{section.text}</p>
                                                                )}
                                                                {section.quote && (
                                                                    <blockquote className="mt-4 border-l-2 border-amber-500/50 pl-4 text-sm italic text-gray-600 dark:text-slate-300">
                                                                        &quot;{section.quote}&quot;
                                                                    </blockquote>
                                                                )}
                                                                {section.embedHtml && (
                                                                    <div
                                                                        className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-white/5"
                                                                        dangerouslySetInnerHTML={{ __html: section.embedHtml }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    )
}
