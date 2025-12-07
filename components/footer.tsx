import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-gray-900">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Products</h3>
                        <ul className="space-y-3">
                            <li><Link href="/web-development" className="text-gray-400 hover:text-white text-sm transition-colors">Web Development</Link></li>
                            <li><Link href="/e-commerce" className="text-gray-400 hover:text-white text-sm transition-colors">E-Commerce Solutions</Link></li>
                            <li><Link href="/app-development" className="text-gray-400 hover:text-white text-sm transition-colors">App Development</Link></li>
                            <li><Link href="/digital-marketing" className="text-gray-400 hover:text-white text-sm transition-colors">Digital Marketing</Link></li>
                            <li><Link href="/ui-ux-design" className="text-gray-400 hover:text-white text-sm transition-colors">UI/UX Design</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><Link href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</Link></li>
                            <li><Link href="/study-materials" className="text-gray-400 hover:text-white text-sm transition-colors">Study Materials</Link></li>
                            <li><Link href="/events" className="text-gray-400 hover:text-white text-sm transition-colors">Events</Link></li>
                            <li><Link href="/free-projects" className="text-gray-400 hover:text-white text-sm transition-colors">Free Projects</Link></li>
                            <li><Link href="/projects" className="text-gray-400 hover:text-white text-sm transition-colors">Projects</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About</Link></li>
                            <li><Link href="/services" className="text-gray-400 hover:text-white text-sm transition-colors">Our Services</Link></li>
                            <li><Link href="/careers" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact us</Link></li>
                            <li><Link href="/help" className="text-gray-400 hover:text-white text-sm transition-colors">Helpline</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Developers</h3>
                        <ul className="space-y-3">
                            <li><Link href="/our-community" className="text-gray-400 hover:text-white text-sm transition-colors">Community</Link></li>
                            <li><Link href="/events" className="text-gray-400 hover:text-white text-sm transition-colors">Community Events</Link></li>
                            <li><Link href="/forum" className="text-gray-400 hover:text-white text-sm transition-colors">Community Forum</Link></li>
                            <li><Link href="/projects" className="text-gray-400 hover:text-white text-sm transition-colors">Websites</Link></li>
                            <li><Link href="/applications" className="text-gray-400 hover:text-white text-sm transition-colors">Applications</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-800 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">© 2025 by Rusha. All Rights Reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Use</Link>
                            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Notice</Link>
                            <Link href="/policy" className="text-sm text-gray-400 hover:text-white transition-colors">Cookies Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
