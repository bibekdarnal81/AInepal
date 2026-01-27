'use client';

const testimonials = [
    {
        quote: " AINepal transformed how we ship. What used to take days now takes minutes. It's genuinely magical.",
        author: "Sarah Chen",
        role: "CTO at TechCorp",
        avatar: "SC",
    },
    {
        quote: "Best developer experience I've had in years.  AINepal just works, and that's exactly what I need.",
        author: "Marcus Rodriguez",
        role: "Indie Developer",
        avatar: "MR",
    },
    {
        quote: "We migrated our entire infrastructure to  AINepal and saved 60% on ops costs. The team loves it.",
        author: "Emily Taylor",
        role: "Engineering Lead at StartupXYZ",
        avatar: "ET",
    },
];

const companies = [
    "Vercel", "Supabase", "Stripe", "Discord", "GitHub", "Linear"
];

export function TestimonialsSection() {
    return (
        <section className="relative py-32 px-6">
            <div className="mx-auto max-w-7xl">
                {/* Trusted by section */}
                <div className="text-center mb-20">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-8">
                        Trusted by developers worldwide
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        {companies.map((company) => (
                            <div
                                key={company}
                                className="text-2xl font-bold text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
                            >
                                {company}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonials grid */}
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
                        Loved by{' '}
                        <span className="text-gradient">developers</span>
                    </h2>
                    <p className="text-xl text-gray-400 text-center mb-16">
                        See what teams are saying about  AINepal
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.author}
                                className="glass glass-hover rounded-xl p-8"
                            >
                                <div className="mb-6">
                                    <svg className="w-10 h-10 text-emerald-400 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                </div>
                                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-purple-pink flex items-center justify-center text-white font-bold">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{testimonial.author}</div>
                                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative mt-20">
                    <div className="glass rounded-2xl p-12 text-center border-gradient">
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to ship faster?
                        </h3>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Join thousands of developers deploying with  AINepal
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#signup"
                                className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-black hover:bg-gray-200 transition-all transform hover:scale-105"
                            >
                                Start Deploying Now
                            </a>
                            <a
                                href="#demo"
                                className="rounded-lg bg-transparent border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all"
                            >
                                Watch Demo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
