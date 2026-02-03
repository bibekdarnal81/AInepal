import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react'
import dbConnect from '@/lib/mongodb/client'
import { BundleOffer, IBundleOffer } from '@/lib/mongodb/models'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getBundle(id: string) {
    await dbConnect()
    try {
        const bundle = await BundleOffer.findById(id).lean<IBundleOffer>()
        if (!bundle || !bundle.isActive) return null
        return bundle
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const bundle = await getBundle(id)

    if (!bundle) {
        return {
            title: 'Bundle Not Found',
        }
    }

    return {
        title: `${bundle.name} | Special Offer`,
        description: bundle.description || `Get ${bundle.name} at a special price.`,
    }
}

export default async function BundleDetailsPage({ params }: PageProps) {
    const { id } = await params
    const bundle = await getBundle(id)

    if (!bundle) {
        notFound()
    }

    const discountedPrice = bundle.discountPercent
        ? bundle.price - (bundle.price * bundle.discountPercent / 100)
        : bundle.price

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/services" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
            </Link>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Visual Section */}
                <div className="space-y-6">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border shadow-md bg-muted/30">
                        {bundle.poster ? (
                            <Image
                                src={bundle.poster}
                                alt={bundle.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                <span className="text-muted-foreground">No Preview Available</span>
                            </div>
                        )}
                        {bundle.discountPercent > 0 && (
                            <div className="absolute top-4 right-4">
                                <Badge variant="destructive" className="text-lg py-1 px-3">
                                    {bundle.discountPercent}% OFF
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">{bundle.name}</h1>
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-primary">
                                NPR {discountedPrice.toLocaleString()}
                            </span>
                            {bundle.discountPercent > 0 && (
                                <span className="text-xl text-muted-foreground line-through">
                                    NPR {bundle.price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {bundle.description && (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-6">
                                <p>{bundle.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500" />
                                <span>{bundle.hostingType} Hosting Included</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500" />
                                <span>Instant Activation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500" />
                                <span>Premium Support</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button size="lg" className="w-full sm:w-auto" asChild>
                            <Link href={`/checkout/bundles/${bundle._id}`}>
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Purchase Now
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
