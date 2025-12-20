import { DeploymentSelector } from '@/components/deployment-selector'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Rocket } from 'lucide-react'

export default function NewDeploymentPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center py-12 px-6">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            New project
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Let's deploy your first service to production
                        </p>
                    </div>

                    {/* Deployment Selector */}
                    <DeploymentSelector type="project" />
                </div>
            </main>

            <Footer />
        </div>
    )
}
