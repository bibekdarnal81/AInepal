import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Clock, Video, Users, Play } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function CourseClassesPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: course } = await supabase
        .from('courses')
        .select('id, title, slug')
        .eq('slug', slug)
        .single()

    if (!course) {
        return null
    }

    const { data: classes } = await supabase
        .from('live_classes')
        .select('*')
        .eq('course_id', course.id)
        .order('scheduled_at', { ascending: false })

    const now = new Date()
    const upcoming = classes?.filter(c => new Date(c.scheduled_at) > now && c.status !== 'cancelled') || []
    const live = classes?.filter(c => c.status === 'live') || []
    const past = classes?.filter(c => c.status === 'ended' || new Date(c.scheduled_at) <= now) || []

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-12">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <Link href={`/courses/${slug}`} className="text-muted-foreground hover:text-foreground mb-6 inline-block">
                        ← Back to {course.title}
                    </Link>

                    <h1 className="text-4xl font-bold text-foreground mb-2">Live Classes</h1>
                    <p className="text-xl text-muted-foreground mb-8">Join live sessions and watch recordings</p>

                    {/* Live Now */}
                    {live.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                                Live Now
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {live.map((liveClass) => (
                                    <Link
                                        key={liveClass.id}
                                        href={`/courses/${slug}/class/${liveClass.id}`}
                                        className="bg-card border-2 border-red-500 rounded-xl p-6 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {liveClass.title}
                                                </h3>
                                                {liveClass.description && (
                                                    <p className="text-muted-foreground mt-2">{liveClass.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-2">
                                                        <Video className="h-4 w-4" />
                                                        {liveClass.stream_type.toUpperCase()}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {liveClass.duration_minutes} min
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium">
                                                <Play className="h-4 w-4" />
                                                Join Now
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Classes */}
                    {upcoming.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Upcoming Classes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcoming.map((liveClass) => {
                                    const scheduledTime = new Date(liveClass.scheduled_at)
                                    const minutesUntil = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000 / 60)
                                    const canJoin = minutesUntil <= 15

                                    return (
                                        <Link
                                            key={liveClass.id}
                                            href={`/courses/${slug}/class/${liveClass.id}`}
                                            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                                        >
                                            <h3 className="text-lg font-semibold text-foreground mb-2">{liveClass.title}</h3>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {scheduledTime.toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {scheduledTime.toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} ({liveClass.duration_minutes} min)
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Video className="h-4 w-4" />
                                                    {liveClass.stream_type.toUpperCase()}
                                                </div>
                                            </div>
                                            {canJoin && (
                                                <div className="mt-4">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded">
                                                        Join available
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Past Classes with Recordings */}
                    {past.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Past Classes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {past.map((liveClass) => (
                                    <div key={liveClass.id} className="bg-card border border-border rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">{liveClass.title}</h3>
                                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(liveClass.scheduled_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        {liveClass.recording_url ? (
                                            <Link
                                                href={liveClass.recording_url}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
                                            >
                                                <Play className="h-4 w-4" />
                                                Watch Recording
                                            </Link>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Recording not available</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!classes || classes.length === 0 && (
                        <div className="text-center py-16">
                            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No live classes scheduled yet.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
