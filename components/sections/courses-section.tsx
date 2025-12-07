import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Award, Users } from 'lucide-react';

export function CoursesSection() {
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
                        <img
                            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop"
                            alt="MERN Stack Course"
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Building a Complete E-commerce Platform with MERN Stack: BabyShop from Scratch to Deployment
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Build a professional e-commerce platform using the MERN Stack. Create customer, admin, and backend applications from scratch and deploy them on Vercel.
                            </p>

                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                                <img
                                    src="https://ui-avatars.com/api/?name=Noor+Mohammad&background=3b82f6&color=fff"
                                    alt="Noor Mohammad"
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">Noor Mohammad</p>
                                    <p className="text-sm text-gray-500">Course Instructor</p>
                                </div>
                            </div>

                            <Link href="/courses">
                                <Button variant="primary" size="lg" className="w-full">
                                    Enroll Now →
                                </Button>
                            </Link>
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
                                <Link href="/projects">
                                    <Button variant="secondary" size="lg">
                                        View Course Details
                                    </Button>
                                </Link>
                                <Link href="/projects">
                                    <Button variant="primary" size="lg">
                                        Enroll Now
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
