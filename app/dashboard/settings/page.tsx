import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/options"
import { User, LogOut, Monitor } from "lucide-react"
import Link from "next/link"
import { GenerateTokenButton } from "@/components/settings/generate-token-button"

export default async function DashboardSettingsPage() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Information
                </h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <input
                                type="text"
                                defaultValue={session.user.name || ''}
                                readOnly
                                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                            <input
                                type="email"
                                defaultValue={session.user.email || ''}
                                readOnly
                                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 opacity-70 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-4">
                            To update your profile information, please contact support or use your connected social account.
                        </p>

                        {/* Sign out button handled by NextAuth client side usually, but linking to signout route also works */}
                        <Link href="/api/auth/signout" className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-medium hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Link>
                    </div>
                </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    IDE Connections
                </h2>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Connect your VS Code extension to access AI features directly in your editor.
                    </p>
                    <GenerateTokenButton />
                </div>
            </div>
        </div>
    )
}
