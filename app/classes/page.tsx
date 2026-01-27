import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import dbConnect from '@/lib/mongodb/client'
import { Class } from '@/lib/mongodb/models'

interface ClassData {
    _id: string
    title: string
    slug: string
    description: string | null
    price: number
    currency: string
    duration: string | null
    schedule: string | null
    maxStudents: number | null
    thumbnailUrl: string | null
    isFeatured: boolean
}

async function getClasses(): Promise<ClassData[]> {
    await dbConnect()
    const classes = await Class.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean()

    const typedClasses = classes as unknown as ClassData[]
    return typedClasses.map((c) => ({
        _id: c._id.toString(),
        title: c.title,
        slug: c.slug,
        description: c.description || null,
        price: c.price || 0,
        currency: c.currency || 'NPR',
        duration: c.duration || null,
        schedule: c.schedule || null,
        maxStudents: c.maxStudents || null,
        thumbnailUrl: c.thumbnailUrl || null,
        isFeatured: c.isFeatured || false,
    }))
}

export default async function ClassesPage() {
    const classes = await getClasses()

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-24 pb-20">
                {/* Hero */}
                <section className="px-6 lg:px-8 mb-16">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span>Learn with Experts</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Upskill with Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Classes</span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Join our expert-led classes and master the skills you need to succeed in the digital world.
                        </p>
                    </div>
                </section>

                {/* Classes Grid */}
                <section className="px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {classes.length === 0 ? (
                            <div className="text-center py-20 bg-card rounded-2xl border border-border">
                                <p className="text-muted-foreground text-lg">No classes available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((classItem) => (
                                    <div
                                        key={classItem._id}
                                        className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:border-blue-500/30 transition-all"
                                    >
                                        {classItem.thumbnailUrl && (
                                            <div className="relative aspect-video bg-secondary overflow-hidden">
                                                <Image
                                                    src={classItem.thumbnailUrl}
                                                    alt={classItem.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 p-6">
                                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors">
                                                {classItem.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                                {classItem.description}
                                            </p>

                                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
                                                {classItem.duration && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{classItem.duration}</span>
                                                    </div>
                                                )}
                                                {classItem.maxStudents && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-4 w-4" />
                                                        <span>Max {classItem.maxStudents}</span>
                                                    </div>
                                                )}
                                                {classItem.schedule && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{classItem.schedule}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 pt-0 mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-2xl font-bold text-foreground">
                                                    {classItem.currency === 'NPR' ? 'रू ' : '$'}
                                                    {classItem.price.toLocaleString()}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/classes/${classItem.slug}`}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                View Details
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
