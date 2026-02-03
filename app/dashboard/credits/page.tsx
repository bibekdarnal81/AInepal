import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import { redirect } from 'next/navigation'
import dbConnect from '@/lib/mongodb/client'
import { User } from '@/lib/mongodb/models'
import { PurchaseCredits } from '@/components/credits/purchase-credits'
import { CreditHistory } from '@/components/credits/credit-history'
import { Coins } from 'lucide-react'

export const metadata = {
    title: 'Credits Dashboard',
    description: 'Manage your AI generation credits',
}

export default async function CreditsPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/auth/signin')
    }

    await dbConnect()
    const user = await User.findById(session.user.id).lean()

    if (!user) {
        redirect('/auth/signin')
    }

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Credits</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your credits for AI generations.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-secondary/50 px-6 py-3 rounded-xl border">
                    <div className="bg-yellow-500/20 p-2 rounded-full">
                        <Coins className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Balance</p>
                        <p className="text-2xl font-bold">{user.credits || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-12">
                <section>
                    <h2 className="text-xl font-semibold mb-6">Purchase Credits</h2>
                    <PurchaseCredits />
                </section>

                <div className="border-t pt-8">
                    <CreditHistory />
                </div>
            </div>
        </div>
    )
}
