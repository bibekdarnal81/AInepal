import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import dbConnect from "@/lib/mongodb/client"
import { User, type IMembership } from "@/lib/mongodb/models"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/login?callbackUrl=/dashboard")
    }

    await dbConnect()
    const user = await User.findById(session.user.id)
        .populate('membershipId')
        .select('membershipId membershipStatus')
        .lean<{ membershipId?: IMembership | null; membershipStatus?: string }>()

    // Transform for component
    // Transform for component
    const membershipName = user?.membershipId?.name
    const membershipData = user?.membershipStatus === 'active' && membershipName ? {
        title: membershipName || 'Member',
        status: user.membershipStatus
    } : null

    return (
        <div className="min-h-screen bg-background dot-grid">
            <div className="flex h-screen overflow-hidden">

                {/* Client Sidebar Component (Handles Mobile Toggle) */}
                <DashboardSidebar user={session.user} membership={membershipData} />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto w-full lg:w-auto">
                    <div className="container mx-auto px-4 py-8 md:px-8 md:py-12 max-w-7xl pt-20 lg:pt-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
