'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Award, Users, MessageSquare, Clock, Star } from 'lucide-react';

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

export function CoursesSection() {
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
            .eq('is_featured', true)
            .limit(2)
            .order('created_at', { ascending: false })

        if (data) {
            setCourses(data)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <section className="bg-gray-100 py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </section>
        )
    }

    if (courses.length === 0) {
        return (
            <section className="bg-gray-100 py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Master Modern Development
                        </h2>
                        <p className="text-gray-600">
                            New courses coming soon! Check back later.
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    const featuredCourse = courses[0]

    return (
        <section className="bg-gray-100 py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Master Modern Development
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Comprehensive courses designed to take you from beginner to expert in modern web development technologies.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-xl overflow-hidden bg-white border-2 border-gray-200 shadow-lg">
                        {featuredCourse.thumbnail_url ? (
                            <img
                                src={featuredCourse.thumbnail_url}
                                alt={featuredCourse.title}
                                className="w-full h-64 object-cover"
                            />
                        ) : (
                            <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <BookOpen className="h-24 w-24 text-white opacity-50" />
                            </div>
                        )}
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${featuredCourse.level === 'beginner' ? 'bg-green-100 text-green-700' :
                                    featuredCourse.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {featuredCourse.level.charAt(0).toUpperCase() + featuredCourse.level.slice(1)}
                                </span>
                                {featuredCourse.duration_hours && (
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="w-4 h-4" />
                                        {featuredCourse.duration_hours} hours
                                    </span>
                                )}
                                {featuredCourse.rating > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        {featuredCourse.rating}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {featuredCourse.title}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {featuredCourse.description || 'Learn modern web development skills with this comprehensive course.'}
                            </p>

                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                <img
                                    src={featuredCourse.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredCourse.instructor_name || 'Instructor')}&background=3b82f6&color=fff`}
                                    alt={featuredCourse.instructor_name || 'Instructor'}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">{featuredCourse.instructor_name || 'Expert Instructor'}</p>
                                    <p className="text-sm text-gray-500">Course Instructor</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-3xl font-bold text-blue-600 mb-2">
                                    Rs {featuredCourse.price.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {featuredCourse.students_count > 0 && `${featuredCourse.students_count.toLocaleString()} students enrolled`}
                                </p>
                            </div>

                            <Link href="/courses">
                                <Button variant="primary" size="lg" className="w-full">
                                    Enroll Now →
                                </Button>
                            </Link>

                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                        detail: { itemType: 'course', itemTitle: featuredCourse.title }
                                    }))
                                }}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                            >
                                <MessageSquare className="h-5 w-5" />
                                Ask About This Course
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Ready to Start Your Journey?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Join thousands of developers who have transformed their careers with our comprehensive courses.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/courses">
                                    <Button variant="secondary" size="lg">
                                        View All Courses
                                    </Button>
                                </Link>
                                <Link href="/courses">
                                    <Button variant="primary" size="lg">
                                        Start Learning
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                {
                                    icon: BookOpen,
                                    title: 'Comprehensive Curriculum',
                                    description: 'In-depth courses covering everything from fundamentals to advanced topics with real-world projects.',
                                },
                                {
                                    icon: Award,
                                    title: 'Industry Recognition',
                                    description: 'Certificates and skills recognized by top tech companies worldwide.',
                                },
                                {
                                    icon: Users,
                                    title: 'Community Support',
                                    description: 'Join a vibrant community of learners and get help from instructors and peers.',
                                },
                            ].map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                                            <p className="text-sm text-gray-600">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
