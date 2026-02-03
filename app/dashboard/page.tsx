import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/options"
import dbConnect from "@/lib/mongodb/client"
import { Order, Domain, HostingOrder, User } from "@/lib/mongodb/models"
import { CreditCard, Globe, Server, Package, ArrowRight, Clock, CheckCircle, XCircle, Crown } from "lucide-react"
import Link from "next/link"

type DashboardOrder = {
    _id: string
    itemTitle?: string
    itemType: string
    createdAt: string
    status: string
    currency: string
    amount: number
}

type MembershipSummary = {
    membershipStatus?: string
    membershipExpiresAt?: string
    membershipId?: {
        title?: string
        name?: string
    } | null
}

/* Data Fetching */
async function getDashboardData(userId: string) {
    await dbConnect()

    const [
        recentOrders,
        servicesCount,
        domainsCount,
        hostingCount,
        activeMembership
    ] = await Promise.all([
        Order.find({ userId }).sort({ createdAt: -1 }).limit(5).lean<DashboardOrder>(),
        Order.countDocuments({ userId, itemType: 'service', status: 'paid' }),
        Domain.countDocuments({ userId, status: 'active' }),
        HostingOrder.countDocuments({ userId, status: 'active' }),
        HostingOrder.countDocuments({ userId, status: 'active' }),
        User.findById(userId)
            .select('membershipId membershipStatus membershipExpiresAt')
            .populate('membershipId')
            .lean<MembershipSummary>()
    ])

    // Get active membership from User model directly if possible, but we don't have user object here easily without another query.
    // Actually session.user has some data, but let's stick to simple stats for now.

    return {
        recentOrders: JSON.parse(JSON.stringify(recentOrders)) as DashboardOrder[],
        stats: {
            services: servicesCount,
            domains: domainsCount,
            hosting: hostingCount,
            membership: activeMembership ? JSON.parse(JSON.stringify(activeMembership)) as MembershipSummary : null
        }
    }
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const { recentOrders, stats } = await getDashboardData(session.user.id)

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Welcome back, {session.user.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground mt-2">Here&apos;s what&apos;s happening with your account.</p>
            </div>

            {/* Membership Banner (if active) */}
            {stats.membership && stats.membership.membershipStatus === 'active' && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-lg">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-2 border border-white/10">
                                <Crown className="w-4 h-4 text-yellow-300" />
                                <span>Current Plan</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-1">{stats.membership.membershipId?.title || 'Premium Member'}</h2>
                            <p className="text-white/80">
                                {stats.membership.membershipExpiresAt ? (
                                    <>Valid until {new Date(stats.membership.membershipExpiresAt).toLocaleDateString()}</>
                                ) : (
                                    <>No expiration date</>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm text-white/60">Status</p>
                                <p className="font-bold text-green-300 flex items-center gap-1 justify-end">
                                    <CheckCircle className="w-4 h-4" /> Active
                                </p>
                            </div>
                            <Link
                                href="/membership/upgrade"
                                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg shadow-black/10"
                            >
                                Upgrade Plan
                            </Link>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Package className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold">{stats.services}</span>
                    </div>
                    <h3 className="font-medium text-foreground">Active Services</h3>
                    <p className="text-sm text-muted-foreground mt-1">Ongoing projects</p>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold">{stats.domains}</span>
                    </div>
                    <h3 className="font-medium text-foreground">Domains</h3>
                    <p className="text-sm text-muted-foreground mt-1">Registered domains</p>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                            <Server className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold">{stats.hosting}</span>
                    </div>
                    <h3 className="font-medium text-foreground">Hosting Plans</h3>
                    <p className="text-sm text-muted-foreground mt-1">Active servers</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Recent Orders</h2>
                        <Link href="/dashboard/orders" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {recentOrders.map((order) => (
                                    <div key={order._id} className="p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {order.status === 'paid' ? <CheckCircle className="w-5 h-5" /> :
                                                    order.status === 'pending' ? <Clock className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">{order.itemTitle || order.itemType}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{order.currency} {order.amount.toLocaleString()}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${order.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No recent orders found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Promo */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Quick Actions</h2>
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Need a new project?</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start a new project with us and transform your business.</p>
                            <Link href="/services" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                                Explore Services
                            </Link>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Billing</h3>
                        <p className="text-sm text-muted-foreground mb-4">Manage your payment methods and billing history.</p>
                        <Link href="/dashboard/orders" className="text-primary text-sm font-medium hover:underline">View Billing History</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
