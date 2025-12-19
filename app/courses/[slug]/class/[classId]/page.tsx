'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Users, Send, ArrowLeft, Play, Video, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface LiveClass {
    id: string
    course_id: string
    title: string
    description: string | null
    scheduled_at: string
    duration_minutes: number
    stream_type: 'youtube' | 'zoom' | 'meet' | 'custom'
    stream_url: string | null
    meeting_id: string | null
    meeting_password: string | null
    is_free: boolean
    price: number
    access_type: 'enrolled' | 'public' | 'paid'
    status: 'scheduled' | 'live' | 'ended' | 'cancelled'
    recording_url: string | null
    chat_enabled: boolean
    courses: {
        title: string
        slug: string
    }
}

interface ChatMessage {
    id: string
    user_id: string
    message: string
    created_at: string
    profiles: {
        display_name: string
    }
}

export default function LiveClassViewerPage({ params }: { params: Promise<{ slug: string; classId: string }> }) {
    const [courseSlug, setCourseSlug] = useState('')
    const [classId, setClassId] = useState('')
    const [liveClass, setLiveClass] = useState<LiveClass | null>(null)
    const [loading, setLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLive, setIsLive] = useState(false)
    const [attendanceRecorded, setAttendanceRecorded] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setCourseSlug(p.slug)
            setClassId(p.classId)
            checkUser()
            fetchLiveClass(p.classId)
        })
    }, [])

    useEffect(() => {
        if (liveClass && user && hasAccess && liveClass.status === 'live') {
            recordAttendance()

            // Subscribe to chat if enabled
            if (liveClass.chat_enabled) {
                fetchChatMessages()
                subscribeToChat()
            }
        }

        return () => {
            // Record leaving time when component unmounts
            if (attendanceRecorded) {
                updateAttendanceLeaveTime()
            }
        }
    }, [liveClass, user, hasAccess])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
    }

    const fetchLiveClass = async (id: string) => {
        const { data, error } = await supabase
            .from('live_classes')
            .select(`
                *,
                courses (title, slug)
            `)
            .eq('id', id)
            .single()

        if (error || !data) {
            router.push('/courses')
            return
        }

        setLiveClass(data as any)
        setIsLive(data.status === 'live')

        // Check access
        await checkAccess(data)

        setLoading(false)
    }

    const checkAccess = async (classData: any) => {
        // Public classes - everyone has access
        if (classData.access_type === 'public') {
            setHasAccess(true)
            return
        }

        // Need to be logged in for enrolled or paid classes
        if (!user) {
            setHasAccess(false)
            return
        }

        // Check if user is enrolled in the course
        const { data: enrollment } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', classData.course_id)
            .eq('item_type', 'course')
            .eq('status', 'completed')
            .single()

        if (enrollment) {
            setHasAccess(true)
        } else if (classData.access_type === 'paid') {
            // For paid classes, check if user has paid for this specific class
            // (This would require a separate payment for the live class)
            setHasAccess(false)
        } else {
            setHasAccess(false)
        }
    }

    const recordAttendance = async () => {
        if (!user || attendanceRecorded) return

        const { error } = await supabase
            .from('class_attendance')
            .insert({
                class_id: classId,
                user_id: user.id,
                joined_at: new Date().toISOString()
            })

        if (!error) {
            setAttendanceRecorded(true)
        }
    }

    const updateAttendanceLeaveTime = async () => {
        if (!user) return

        await supabase
            .from('class_attendance')
            .update({
                left_at: new Date().toISOString()
            })
            .eq('class_id', classId)
            .eq('user_id', user.id)
    }

    const fetchChatMessages = async () => {
        const { data } = await supabase
            .from('class_chat_messages')
            .select(`
                *,
                profiles (display_name)
            `)
            .eq('class_id', classId)
            .order('created_at', { ascending: true })
            .limit(100)

        if (data) {
            setChatMessages(data as any)
        }
    }

    const subscribeToChat = () => {
        const channel = supabase
            .channel(`class_chat_${classId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'class_chat_messages',
                filter: `class_id=eq.${classId}`
            }, (payload) => {
                // Fetch the new message with profile data
                supabase
                    .from('class_chat_messages')
                    .select(`
                        *,
                        profiles (display_name)
                    `)
                    .eq('id', payload.new.id)
                    .single()
                    .then(({ data }) => {
                        if (data) {
                            setChatMessages(prev => [...prev, data as any])
                        }
                    })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !user) return

        await supabase
            .from('class_chat_messages')
            .insert({
                class_id: classId,
                user_id: user.id,
                message: newMessage.trim()
            })

        setNewMessage('')
    }

    const getEmbed Url = () => {
        if (!liveClass?.stream_url) return ''

        const url = liveClass.stream_url

        // YouTube embed
        if (liveClass.stream_type === 'youtube') {
            const videoId = url.includes('watch?v=')
                ? url.split('watch?v=')[1]?.split('&')[0]
                : url.split('/').pop()
            return `https://www.youtube.com/embed/${videoId}?autoplay=1`
        }

        // For custom embeds, return as-is
        return url
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!liveClass) {
        return null
    }

    const scheduledTime = new Date(liveClass.scheduled_at)
    const now = new Date()
    const minutesUntilStart = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000 / 60)
    const canJoin = minutesUntilStart <= 15 || isLive

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <Link
                        href={`/courses/${courseSlug}`}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Course
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Video Area */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-card rounded-xl border border-border overflow-hidden">
                                {hasAccess && canJoin ? (
                                    <div className="aspect-video bg-black">
                                        {liveClass.stream_type === 'youtube' || liveClass.stream_type === 'custom' ? (
                                            <iframe
                                                src={getEmbedUrl()}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                <div className="text-center space-y-4">
                                                    <Video className="h-16 w-16 mx-auto opacity-50" />
                                                    <div>
                                                        <p className="text-lg font-medium mb-2">Join via {liveClass.stream_type === 'zoom' ? 'Zoom' : 'Google Meet'}</p>
                                                        <a
                                                            href={liveClass.stream_url || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                            Join Meeting
                                                        </a>
                                                        {liveClass.meeting_password && (
                                                            <p className="text-sm mt-2 opacity-75">
                                                                Password: {liveClass.meeting_password}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : !hasAccess ? (
                                    <div className="aspect-video bg-secondary flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-foreground mb-2">Enrollment Required</h3>
                                            <p className="text-muted-foreground mb-4">
                                                {liveClass.access_type === 'enrolled'
                                                    ? 'You need to enroll in this course to join the live class.'
                                                    : `This is a paid live class. Price: $${liveClass.price}`
                                                }
                                            </p>
                                            {liveClass.access_type === 'enrolled' && (
                                                <Link
                                                    href={`/courses/${courseSlug}`}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                                >
                                                    Enroll Now
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-secondary flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-foreground mb-2">Class Starts Soon</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Join button will be available 15 minutes before start time
                                            </p>
                                            <p className="text-2xl font-bold text-primary">
                                                {minutesUntilStart > 0 ? `${minutesUntilStart} minutes` : 'Starting now'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Class Info */}
                            <div className="bg-card rounded-xl border border-border p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-foreground mb-2">{liveClass.title}</h1>
                                        {liveClass.description && (
                                            <p className="text-muted-foreground">{liveClass.description}</p>
                                        )}
                                    </div>
                                    {isLive && (
                                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full animate-pulse">
                                            • LIVE
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {scheduledTime.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
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
                                </div>
                            </div>
                        </div>

                        {/* Chat Sidebar */}
                        {liveClass.chat_enabled && hasAccess && canJoin && (
                            <div className="bg-card rounded-xl border border-border flex flex-col h-[600px]">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Live Chat
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className="space-y-1">
                                            <p className="text-xs font-medium text-primary">{msg.profiles.display_name}</p>
                                            <p className="text-sm text-foreground bg-secondary rounded-lg p-2">{msg.message}</p>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                {user ? (
                                    <form onSubmit={sendMessage} className="p-4 border-t border-border">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button
                                                type="submit"
                                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="p-4 border-t border-border text-center">
                                        <p className="text-sm text-muted-foreground mb-2">Login to chat</p>
                                        <Link href="/auth/login" className="text-sm text-primary hover:underline">
                                            Login
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
