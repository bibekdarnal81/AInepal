import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Clock, BarChart, Users, Star, CheckCircle, PlayCircle, MessageSquare, AlertCircle, Award } from 'lucide-react'
import { notFound } from 'next/navigation'

interface CourseDetailProps {
    params: Promise<{
        slug: string
    }>
}

export default async function CourseDetailPage({ params }: CourseDetailProps) {
    const { slug } = await params
    const supabase = createClient()

    // Fetch course details
    const { data: course, error } = await supabase
        .from('courses')
        .select(`
            *,
            curriculum:course_sections(
                *,
                lessons:course_lessons(*)
            )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (error || !course) {
        console.error('Error fetching course:', error)
        notFound()
    }

    // Sort curriculum by order_index
    const sections = course.curriculum?.sort((a: any, b: any) => a.order_index - b.order_index) || []
    sections.forEach((section: any) => {
        section.lessons?.sort((a: any, b: any) => a.order_index - b.order_index)
    })

    const totalLessons = sections.reduce((acc: number, section: any) => acc + (section.lessons?.length || 0), 0)

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 pt-24 pb-16">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.level === 'beginner' ? 'bg-green-500/20 text-green-300' :
                                        course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-red-500/20 text-red-300'
                                        }`}>
                                        {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        {course.duration_hours} hours
                                    </span>
                                    {course.rating > 0 && (
                                        <span className="flex items-center gap-1 text-sm text-yellow-400">
                                            <Star className="w-4 h-4 fill-yellow-400" />
                                            {course.rating} ({course.students_count} students)
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                                    {course.title}
                                </h1>

                                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                    {course.description}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img
                                                src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor_name || 'Instructor')}&background=random`}
                                                alt={course.instructor_name || 'Instructor'}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium text-white">{course.instructor_name || 'Expert Instructor'}</p>
                                                <p className="text-xs text-gray-400">Instructor</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Price</p>
                                            <p className="text-2xl font-bold text-white">
                                                {course.currency} {course.price?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href={`/enroll?course_slug=${slug}`} className="flex-1">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg">
                                            Enroll Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                            <BookOpen className="w-20 h-20 text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                                            <PlayCircle className="w-16 h-16" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-12">
                                {/* What you'll learn */}
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                        What you'll learn
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Placeholder traits - could be added to DB later */}
                                        <div className="flex gap-3 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <p className="text-gray-300 text-sm">Comprehensive understanding of core concepts</p>
                                        </div>
                                        <div className="flex gap-3 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <p className="text-gray-300 text-sm">Real-world project implementation</p>
                                        </div>
                                        <div className="flex gap-3 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <p className="text-gray-300 text-sm">Best practices and design patterns</p>
                                        </div>
                                        <div className="flex gap-3 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <p className="text-gray-300 text-sm">Production deployment strategies</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Curriculum */}
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-blue-500" />
                                        Course Curriculum
                                    </h2>

                                    {sections.length > 0 ? (
                                        <div className="space-y-4">
                                            {sections.map((section: any) => (
                                                <div key={section.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                                                    <div className="p-4 bg-white/5 flex items-center justify-between">
                                                        <h3 className="font-medium text-white">{section.title}</h3>
                                                        <span className="text-sm text-gray-400">{section.lessons?.length || 0} lessons</span>
                                                    </div>
                                                    <div className="divide-y divide-white/5">
                                                        {section.lessons?.map((lesson: any) => (
                                                            <div key={lesson.id} className="p-4 pl-8 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                                                                <PlayCircle className="w-4 h-4 text-blue-500" />
                                                                <span className="text-gray-300 text-sm hover:text-white transition-colors">{lesson.title}</span>
                                                                {lesson.is_free && (
                                                                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                                                        Preview
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 rounded-xl border border-white/10 bg-white/5 text-center">
                                            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                            <p className="text-gray-400">Curriculum details coming soon.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 sticky top-24">
                                    <h3 className="text-xl font-bold mb-6">This course includes:</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <PlayCircle className="w-5 h-5 text-purple-400" />
                                            <span>{course.duration_hours} hours on-demand video</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <BookOpen className="w-5 h-5 text-purple-400" />
                                            <span>{totalLessons} lessons</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <BarChart className="w-5 h-5 text-purple-400" />
                                            <span>Full lifetime access</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <Users className="w-5 h-5 text-purple-400" />
                                            <span>Access on mobile and TV</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <Award className="w-5 h-5 text-purple-400" />
                                            <span>Certificate of completion</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
