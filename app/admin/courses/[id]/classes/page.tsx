'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Users, Video, Edit, Trash2, Plus, X, Save, Play, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface LiveClass {
    id: string
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
    max_attendees: number | null
    status: 'scheduled' | 'live' | 'ended' | 'cancelled'
    recording_url: string | null
    chat_enabled: boolean
    _count?: {
        class_attendance: number
    }
}

interface Course {
    id: string
    title: string
}

export default function CourseClassesPage({ params }: { params: Promise<{ id: string }> }) {
    const [courseId, setCourseId] = useState<string>('')
    const [course, setCourse] = useState<Course | null>(null)
    const [classes, setClasses] = useState<LiveClass[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingClass, setEditingClass] = useState<LiveClass | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        stream_type: 'youtube' as LiveClass['stream_type'],
        stream_url: '',
        meeting_id: '',
        meeting_password: '',
        is_free: true,
        price: 0,
        access_type: 'enrolled' as LiveClass['access_type'],
        max_attendees: null as number | null,
        chat_enabled: true,
    })
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setCourseId(p.id)
            fetchCourse(p.id)
            fetchClasses(p.id)
        })
    }, [])

    const fetchCourse = async (id: string) => {
        const { data } = await supabase
            .from('courses')
            .select('id, title')
            .eq('id', id)
            .single()

        if (data) setCourse(data)
    }

    const fetchClasses = async (id: string) => {
        const { data } = await supabase
            .from('live_classes')
            .select('*')
            .eq('course_id', id)
            .order('scheduled_at', { ascending: false })

        if (data) setClasses(data)
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const classData = {
            ...formData,
            course_id: courseId,
            max_attendees: formData.max_attendees || null,
            price: formData.is_free ? 0 : formData.price,
        }

        if (editingClass) {
            const { error } = await supabase
                .from('live_classes')
                .update(classData)
                .eq('id', editingClass.id)

            if (!error) {
                await fetchClasses(courseId)
                resetForm()
            }
        } else {
            const { error } = await supabase
                .from('live_classes')
                .insert(classData)

            if (!error) {
                await fetchClasses(courseId)
                resetForm()
            }
        }
    }

    const handleDelete = async (classId: string) => {
        if (!confirm('Are you sure you want to delete this live class?')) return

        const { error } = await supabase
            .from('live_classes')
            .delete()
            .eq('id', classId)

        if (!error) {
            await fetchClasses(courseId)
        }
    }

    const handleEdit = (liveClass: LiveClass) => {
        setEditingClass(liveClass)
        setFormData({
            title: liveClass.title,
            description: liveClass.description || '',
            scheduled_at: new Date(liveClass.scheduled_at).toISOString().slice(0, 16),
            duration_minutes: liveClass.duration_minutes,
            stream_type: liveClass.stream_type,
            stream_url: liveClass.stream_url || '',
            meeting_id: liveClass.meeting_id || '',
            meeting_password: liveClass.meeting_password || '',
            is_free: liveClass.is_free,
            price: liveClass.price,
            access_type: liveClass.access_type,
            max_attendees: liveClass.max_attendees,
            chat_enabled: liveClass.chat_enabled,
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingClass(null)
        setFormData({
            title: '',
            description: '',
            scheduled_at: '',
            duration_minutes: 60,
            stream_type: 'youtube',
            stream_url: '',
            meeting_id: '',
            meeting_password: '',
            is_free: true,
            price: 0,
            access_type: 'enrolled',
            max_attendees: null,
            chat_enabled: true,
        })
    }

    const getStatusBadge = (status: LiveClass['status']) => {
        const badges = {
            scheduled: { color: 'bg-blue-500/10 text-blue-500', label: 'Scheduled' },
            live: { color: 'bg-green-500/10 text-green-500', label: 'Live Now' },
            ended: { color: 'bg-gray-500/10 text-gray-500', label: 'Ended' },
            cancelled: { color: 'bg-red-500/10 text-red-500', label: 'Cancelled' },
        }
        const badge = badges[status]
        return <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}>{badge.label}</span>
    }

    const getStreamIcon = (type: LiveClass['stream_type']) => {
        return <Video className="h-4 w-4" />
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/admin/courses/${courseId}`} className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
                        ← Back to Course
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">{course?.title} - Live Classes</h1>
                    <p className="text-muted-foreground mt-1">Schedule and manage live streaming classes</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Schedule Class
                </button>
            </div>

            {/* Live Classes List */}
            <div className="grid grid-cols-1 gap-4">
                {classes.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No live classes scheduled yet.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 text-primary hover:text-primary/80"
                        >
                            Schedule your first class →
                        </button>
                    </div>
                ) : (
                    classes.map((liveClass) => (
                        <div key={liveClass.id} className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-foreground">{liveClass.title}</h3>
                                        {getStatusBadge(liveClass.status)}
                                        <span className="px-2 py-1 text-xs font-medium rounded bg-secondary text-foreground">
                                            {liveClass.stream_type.toUpperCase()}
                                        </span>
                                    </div>
                                    {liveClass.description && (
                                        <p className="text-sm text-muted-foreground mb-4">{liveClass.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(liveClass.scheduled_at).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {new Date(liveClass.scheduled_at).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })} ({liveClass.duration_minutes} min)
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {liveClass.access_type === 'public' ? 'Public' : liveClass.access_type === 'paid' ? `Paid ($${liveClass.price})` : 'Enrolled Only'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(liveClass)}
                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(liveClass.id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-2xl w-full my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-foreground">
                                {editingClass ? 'Edit Live Class' : 'Schedule New Class'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Scheduled Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_at}
                                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                                        className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Stream Type</label>
                                <select
                                    value={formData.stream_type}
                                    onChange={(e) => setFormData({ ...formData, stream_type: e.target.value as LiveClass['stream_type'] })}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="youtube">YouTube Live</option>
                                    <option value="zoom">Zoom</option>
                                    <option value="meet">Google Meet</option>
                                    <option value="custom">Custom Embed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {formData.stream_type === 'youtube' || formData.stream_type === 'custom' ? 'Stream URL' : 'Meeting Link'}
                                </label>
                                <input
                                    type="url"
                                    value={formData.stream_url}
                                    onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder={formData.stream_type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : formData.stream_type === 'zoom' ? 'https://zoom.us/j/...' : 'https://meet.google.com/...'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Access Type</label>
                                <select
                                    value={formData.access_type}
                                    onChange={(e) => setFormData({ ...formData, access_type: e.target.value as LiveClass['access_type'] })}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="enrolled">Enrolled Students Only</option>
                                    <option value="public">Public (Anyone can join)</option>
                                    <option value="paid">Paid (Separate payment required)</option>
                                </select>
                            </div>

                            {formData.access_type === 'paid' && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value), is_free: false })}
                                        className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="chat_enabled"
                                    checked={formData.chat_enabled}
                                    onChange={(e) => setFormData({ ...formData, chat_enabled: e.target.checked })}
                                    className="rounded border-border"
                                />
                                <label htmlFor="chat_enabled" className="text-sm font-medium text-foreground">
                                    Enable live chat during class
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    {editingClass ? 'Update Class' : 'Schedule Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
