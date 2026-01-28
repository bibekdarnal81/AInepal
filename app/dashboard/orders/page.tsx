import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb/client"
import { Order } from "@/lib/mongodb/models"
import { CheckCircle, Clock, XCircle, Package, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"
import { OrderActions } from "./order-actions"
import { VerifyPayment } from "./verify-payment"

type OrderRow = {
    _id: string
    itemTitle?: string
    itemType: string
    createdAt: string
    status: string
    currency: string
    amount: number
}

async function getOrders(userId: string) {
    await dbConnect()
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean<OrderRow>()
    return JSON.parse(JSON.stringify(orders)) as OrderRow[]
}

export default async function DashboardOrdersPage() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const orders = await getOrders(session.user.id)

    return (
        <div className="space-y-6 animate-fade-in">
            <VerifyPayment />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Orders</h1>
                    <p className="text-muted-foreground">Manage and track your purchases.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/30 text-left">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Item</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Date</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Amount</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Status</th>
                                    <th className="px-6 py-4 font-medium text-muted-foreground text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-secondary/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{order.itemTitle || order.itemType}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{order.itemType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {order.currency} {order.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${order.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {order.status === 'paid' ? <CheckCircle className="w-3.5 h-3.5" /> :
                                                    order.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                <span className="capitalize">{order.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <OrderActions orderId={order._id} isAdmin={session.user.isAdmin} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Package className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">Looks like you haven&apos;t made any purchases yet.</p>
                        <Link href="/services" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                            Browse Services
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
