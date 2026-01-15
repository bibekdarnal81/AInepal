'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, Settings, ShoppingBag, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            await checkAdminStatus(user.id);
            await fetchAvatar(user.id);
        }
    };

    const fetchAvatar = async (userId: string) => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        setAvatarUrl(profile?.avatar_url || '');
    };

    const checkAdminStatus = async (userId: string) => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        setIsAdmin(profile?.is_admin || false);
    };

    useEffect(() => {
        (async () => {
            await checkUser();
        })();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                checkAdminStatus(session.user.id);
                fetchAvatar(session.user.id);
            } else {
                setIsAdmin(false);
                setAvatarUrl('');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        setUserMenuOpen(false);
    };

    const navigation = [
        { name: 'Services', href: '/services' },
        { name: 'Classes', href: '/classes' },
        { name: 'Careers', href: '/careers' },
        { name: 'Projects', href: '/projects' },
        { name: 'Blog', href: '/blog' },
    ];

    return (
        <header
            className={`fixed left-0 right-0 z-50 transition-all duration-300 flex justify-center ${isScrolled
                ? 'top-[calc(var(--banner-height,0px)+1rem)]'
                : 'top-[var(--banner-height,0px)]'
                }`}
        >
            <div
                className={`transition-all duration-300 w-full ${isScrolled
                    ? 'bg-background/80 backdrop-blur-md border border-border shadow-lg rounded-full max-w-5xl mx-4'
                    : 'bg-transparent border-b border-transparent'
                    }`}
            >
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6 lg:px-8" aria-label="Global">

                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2.5 group">
                            <Image
                                src="/logo.png"
                                alt="Dunzo"
                                width={120}
                                height={40}
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:gap-x-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                    relative px-4 py-2 text-sm font-medium rounded-full transition-colors
                                    ${isActive
                                            ? 'text-foreground bg-secondary/50'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                                        }
                                `}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center gap-4">
                        <ThemeToggle />
                        {user ? (
                            // Logged in - Show user menu
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-secondary/30 hover:bg-secondary/50 border border-border/50 transition-all"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center overflow-hidden">
                                        {avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt="Profile"
                                                width={24}
                                                height={24}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[10px] font-bold text-white">
                                                {user.email?.[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                                        {user.email?.split('@')[0]}
                                    </span>
                                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-56 rounded-xl bg-popover border border-border/50 shadow-2xl shadow-black/20 z-20 overflow-hidden"
                                            >
                                                <div className="p-1.5 space-y-0.5">
                                                    {isAdmin && (
                                                        <Link
                                                            href="/admin"
                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                                                            onClick={() => setUserMenuOpen(false)}
                                                        >
                                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                                            Admin Panel
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href="/profile"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        My Profile
                                                    </Link>
                                                    <Link
                                                        href="/profile?tab=orders"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                                        My Orders
                                                    </Link>
                                                    <div className="h-px bg-border/50 my-1 mx-2" />
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            // Not logged in
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                            >
                                Sign in
                            </Link>
                        )}

                        <Link
                            href="/book-demo"
                            className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-primary px-6 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105"
                        >
                            <span className="relative text-sm font-semibold">Book a Demo</span>
                        </Link>
                    </div>
                </nav>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border/50">
                                <Link href="/" className="-m-1.5 p-1.5 flex items-center">
                                    <Image
                                        src="/logo.jpg"
                                        alt="Dunzo"
                                        width={120}
                                        height={40}
                                        className="h-10 w-auto object-contain"
                                    />
                                </Link>
                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    <button
                                        type="button"
                                        className="-m-2.5 rounded-full p-2.5 text-foreground hover:bg-secondary/50 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="sr-only">Close menu</span>
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col p-6 space-y-6">
                                <div className="space-y-2">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="block rounded-lg px-3 py-3 text-lg font-semibold text-foreground hover:bg-secondary/50 transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>

                                <div className="h-px bg-border/50" />

                                <div className="space-y-4">
                                    {user ? (
                                        <>
                                            <div className="flex items-center gap-4 px-3 py-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold">
                                                    {avatarUrl ? (
                                                        <Image
                                                            src={avatarUrl}
                                                            alt="Profile"
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        user.email?.[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.email}</p>
                                                    <p className="text-xs text-muted-foreground p-0.5">Logged in</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {isAdmin && (
                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 font-medium hover:bg-secondary transition-colors"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        Admin
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 font-medium hover:bg-secondary transition-colors"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <User className="h-4 w-4" />
                                                    Profile
                                                </Link>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <Link
                                                href="/auth/login"
                                                className="flex items-center justify-center px-4 py-3 rounded-xl border border-border font-semibold hover:bg-secondary transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href="/book-demo"
                                                className="flex items-center justify-center px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Book Demo
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
