'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        checkUser();

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        setUserMenuOpen(false);
    };

    const navigation = [
        { name: 'Products', href: '#products' },
        { name: 'Docs', href: '#docs' },
        { name: 'Blog', href: '/blog' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <header
            className={`sticky top-[var(--banner-height,0px)] z-50 transition-all duration-300 ${isScrolled
                ? 'bg-black/80 backdrop-blur-lg border-b border-white/10'
                : 'bg-transparent'
                }`}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5">
                        <span className="text-2xl font-bold text-gradient">
                            NextNepal
                        </span>
                    </Link>
                </div>

                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="hidden lg:flex lg:gap-x-8 lg:items-center">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}

                    <div className="flex items-center gap-x-4 ml-4">
                        {user ? (
                            // Logged in - Show user menu
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
                                        {avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt="Profile"
                                                width={28}
                                                height={28}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-medium text-white">
                                                {user.email?.[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-white max-w-[120px] truncate">
                                        {user.email}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-black/90 backdrop-blur-lg border border-white/10 shadow-xl z-20">
                                            <div className="p-2 space-y-1">
                                                {isAdmin && (
                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        Admin Panel
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <User className="h-4 w-4" />
                                                    My Profile
                                                </Link>
                                                <Link
                                                    href="/profile?tab=orders"
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                    My Orders
                                                </Link>
                                                <hr className="my-1 border-white/10" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            // Not logged in - Show login button
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/book-demo"
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all transform hover:scale-105"
                                >
                                    Book a Demo
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden">
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-black/95 backdrop-blur-lg px-6 py-6 sm:max-w-sm border-l border-white/10">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="-m-1.5 p-1.5">
                                <span className="text-2xl font-bold text-gradient">
                                    NextNepal
                                </span>
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-white/10">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="space-y-2 py-6">
                                    {user ? (
                                        <>
                                            <div className="px-3 py-2 mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
                                                        {avatarUrl ? (
                                                            <Image
                                                                src={avatarUrl}
                                                                alt="Profile"
                                                                width={40}
                                                                height={40}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-medium text-white">
                                                                {user.email?.[0].toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{user.email}</p>
                                                        <p className="text-xs text-gray-400">Logged in</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Settings className="h-5 w-5" />
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <Link
                                                href="/profile"
                                                className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <User className="h-5 w-5" />
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/profile?tab=orders"
                                                className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <ShoppingBag className="h-5 w-5" />
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="-mx-3 w-full flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-red-400 hover:bg-red-500/10"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth/login"
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/book-demo"
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Book a Demo
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
