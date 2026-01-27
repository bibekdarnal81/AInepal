"use client";

import React from 'react';
import Link from 'next/link';
import { LayoutGrid, Bell, Gift, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BuilderHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black border-b border-white/5 h-14">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                    <div className="p-1 rounded bg-white/10">
                        <LayoutGrid className="w-4 h-4" />
                    </div>
                    <span>Home</span>
                </Link>

                <div className="h-4 w-[1px] bg-white/10" />

                <div className="flex items-center gap-2 text-sm text-gray-400">


                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                <Button
                    size="sm"
                    className="bg-yellow-500/90 hover:bg-yellow-500 text-black font-semibold rounded-full px-4 h-8 text-xs gap-1"
                >
                    <Plus className="w-3 h-3" />
                    Buy Credits
                </Button>

                <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-4 h-4" />
                </button>

                <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Gift className="w-4 h-4" />
                </button>

                <button className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-medium text-white ring-2 ring-transparent hover:ring-white/20 transition-all">
                    U
                </button>
            </div>
        </header>
    );
}
