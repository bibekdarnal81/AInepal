import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
    return (
        <footer className="relative border-t border-border/60 bg-card/80">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div>
                        <h3 className="text-sm font-semibold text-primary mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><Link href="#features" className="text-muted hover:text-primary text-sm transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="text-muted hover:text-primary text-sm transition-colors">Pricing</Link></li>
                            <li><Link href="#docs" className="text-muted hover:text-primary text-sm transition-colors">Documentation</Link></li>
                            <li><Link href="#changelog" className="text-muted hover:text-primary text-sm transition-colors">Changelog</Link></li>
                            <li><Link href="#roadmap" className="text-muted hover:text-primary text-sm transition-colors">Roadmap</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-primary mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><Link href="#blog" className="text-muted hover:text-primary text-sm transition-colors">Blog</Link></li>
                            <li><Link href="#guides" className="text-muted hover:text-primary text-sm transition-colors">Guides</Link></li>
                            <li><Link href="#templates" className="text-muted hover:text-primary text-sm transition-colors">Templates</Link></li>
                            <li><Link href="#examples" className="text-muted hover:text-primary text-sm transition-colors">Examples</Link></li>
                            <li><Link href="#community" className="text-muted hover:text-primary text-sm transition-colors">Community</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-primary mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><Link href="#about" className="text-muted hover:text-primary text-sm transition-colors">About</Link></li>
                            <li><Link href="#careers" className="text-muted hover:text-primary text-sm transition-colors">Careers</Link></li>
                            <li><Link href="#contact" className="text-muted hover:text-primary text-sm transition-colors">Contact</Link></li>
                            <li><Link href="#partners" className="text-muted hover:text-primary text-sm transition-colors">Partners</Link></li>
                            <li><Link href="#press" className="text-muted hover:text-primary text-sm transition-colors">Press Kit</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-primary mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link href="#terms" className="text-muted hover:text-primary text-sm transition-colors">Terms of Service</Link></li>
                            <li><Link href="#privacy" className="text-muted hover:text-primary text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#security" className="text-muted hover:text-primary text-sm transition-colors">Security</Link></li>
                            <li><Link href="#cookies" className="text-muted hover:text-primary text-sm transition-colors">Cookie Policy</Link></li>
                            <li><Link href="#dpa" className="text-muted hover:text-primary text-sm transition-colors">DPA</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-border/60 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src="/logo.jpg"
                                    alt="Dunzo"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-lg object-cover"
                                />
                                <span className="text-xl font-bold text-gradient">Dunzo</span>
                            </Link>
                            <p className="text-sm text-muted">© 2025 Dunzo. All rights reserved.</p>
                        </div>

                        <div className="flex gap-6">
                            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                            <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors">
                                <Youtube className="h-5 w-5" />
                                <span className="sr-only">YouTube</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
