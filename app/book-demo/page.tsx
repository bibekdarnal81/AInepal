'use client';

import { BookDemoForm } from '@/components/sections/book-demo-form';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';

export default function BookDemoPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
                {/* Background-effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50 blur-3xl" />
                </div>

                <div className="mx-auto max-w-2xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
                            Book a Demo
                        </h1>
                        <p className="text-lg leading-8 text-muted-foreground">
                            Experience the power of our platform firsthand. Fill out the form below and we'll schedule a time that works for you.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-sm"
                    >
                        <BookDemoForm />
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
