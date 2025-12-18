'use client'

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, Award, Clock, MessageSquare, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface Course {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnail_url: string | null
    price: number
    currency: string
    duration_hours: number | null
    level: string
    instructor_name: string | null
    instructor_avatar: string | null
    students_count: number
    rating: number
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })

        if (data) {
            setCourses(data)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                            Our Courses
                        </h1>
                        <p className="text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                            Master modern web development with our comprehensive courses. Learn from industry experts and build real-world projects.
                        </p>
                    </div>
                </section>

                {/* Courses Grid */}
                <section className="bg-slate-950 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Link href={`/courses/${course.slug}`}>
                                                {course.thumbnail_url ? (
                                                    <img
                                                        src={course.thumbnail_url}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                                        <BookOpen className="h-16 w-16 text-slate-500" />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.level === 'beginner' ? 'bg-green-500/20 text-green-300' :
                                                    course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                                                        'bg-red-500/20 text-red-300'
                                                    }`}>
                                                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                                </span>
                                                {course.duration_hours && (
                                                    <span className="flex items-center gap-1 text-sm text-gray-400">
                                                        <Clock className="w-4 h-4" />
                                                        {course.duration_hours}h
                                                    </span>
                                                )}
                                                {course.rating > 0 && (
                                                    <span className="flex items-center gap-1 text-sm text-gray-400">
                                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                                        {course.rating}
                                                    </span>
                                                )}
                                            </div>

                                            <Link href={`/courses/${course.slug}`}>
                                                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                                    {course.title}
                                                </h3>
                                            </Link>

                                            <p className="text-gray-400 mb-4 line-clamp-2">
                                                {course.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-400">{course.instructor_name || 'Rusha'}</span>
                                                </div>
                                                <Link href={`/enroll?course_slug=${course.slug}`}>
                                                    <Button variant="primary" size="sm">
                                                        Enroll Now
                                                    </Button>
                                                </Link>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                        detail: { itemType: 'course', itemTitle: course.title }
                                                    }))
                                                }}
                                                className="w-full mt-4 flex items-center justify-center gap-2 py-2 border-2 border-purple-500/50 text-purple-300 rounded-lg font-medium hover:bg-purple-500/10 transition-colors"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Ask About This Course
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-purple-900 to-blue-900 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to Start Learning?
                        </h2>
                        <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
                            Join thousands of students who have transformed their careers with our courses.
                        </p>
                        <Link href="/contact">
                            <Button variant="secondary" size="lg">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
