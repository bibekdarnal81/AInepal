import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6 animate-fade-in">
                        Welcome to ReactBD
                    </h1>
                    <p className="text-lg leading-8 text-gray-600 mb-8 animate-fade-in-up">
                        Empower your business with a custom website or learn new skills with our courses. Get started today!
                    </p>
                    <div className="flex items-center justify-center gap-x-6 animate-fade-in-up">
                        <Link href="#projects">
                            <Button variant="primary" size="lg">
                                Get Custom Website
                            </Button>
                        </Link>
                        <Link href="/tools">
                            <Button variant="secondary" size="lg">
                                Explore Our Tools
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
