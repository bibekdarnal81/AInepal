import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, Award, Clock } from 'lucide-react';

const courses = [
    {
        id: 1,
        title: 'Building a Complete E-commerce Platform with MERN Stack',
        description: 'Build a professional e-commerce platform using the MERN Stack. Create customer, admin, and backend applications from scratch.',
        instructor: 'Noor Mohammad',
        duration: '40 hours',
        level: 'Intermediate',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
    },
    {
        id: 2,
        title: 'Master React & Next.js - Complete Guide',
        description: 'Learn React and Next.js from basics to advanced. Build real-world projects and deploy them to production.',
        instructor: 'Sarah Johnson',
        duration: '35 hours',
        level: 'Beginner',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
    },
    {
        id: 3,
        title: 'Full-Stack Web Development Bootcamp',
        description: 'Comprehensive bootcamp covering HTML, CSS, JavaScript, Node.js, databases, and deployment strategies.',
        instructor: 'Michael Chen',
        duration: '60 hours',
        level: 'Beginner',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
    },
    {
        id: 4,
        title: 'Advanced TypeScript & Design Patterns',
        description: 'Master TypeScript and learn design patterns to write scalable, maintainable code for enterprise applications.',
        instructor: 'Emily Davis',
        duration: '25 hours',
        level: 'Advanced',
        image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=600&fit=crop',
    },
];

export default function CoursesPage() {
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
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                                                {course.level}
                                            </span>
                                            <span className="flex items-center gap-1 text-sm text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                {course.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                            {course.title}
                                        </h3>

                                        <p className="text-gray-400 mb-4 line-clamp-2">
                                            {course.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-400">{course.instructor}</span>
                                            </div>
                                            <Link href={`/courses/${course.id}`}>
                                                <Button variant="primary" size="sm">
                                                    Enroll Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
