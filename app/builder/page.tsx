"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mic, Github, Hash, Globe, ArrowRight, RefreshCw, Sparkles, Box, Smartphone, Layout } from 'lucide-react';

export default function BuilderPreparationPage() {
    const [activeTab, setActiveTab] = useState('landing-page');
    const [prompt, setPrompt] = useState('');

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const quickStarts = [
        { icon: <Box className="w-4 h-4" />, label: "Clone Youtube" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Idea Logger" },
        { icon: <Layout className="w-4 h-4" />, label: "Consult Plus" },
        { icon: <Sparkles className="w-4 h-4" />, label: "Surprise Me" },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-purple-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <header className="absolute top-4 right-4 flex gap-4">
                {/* Placeholder for header actions if any */}
            </header>

            <main className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">

                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 flex items-center gap-2 text-sm text-blue-200 mb-8 self-center">
                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">New</span>
                    <span>Celebrating Emergent's series B funding 🚀, FLAT 75% off on Standard monthly plan.</span>
                    <span className="ml-2 font-mono bg-black/40 px-2 py-0.5 rounded text-xs border border-white/10 flex items-center gap-1">
                        W4OEJUHL <span className="text-gray-400 cursor-pointer hover:text-white">Copy</span>
                    </span>
                </div>

                {/* Project Selector - simplified for now */}
                <div className="flex items-center gap-2 mb-4 bg-gray-900/50 p-1 rounded-full border border-white/10">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Upwork's Project
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-medium text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-8">
                    What will you build today?
                </h1>

                <div className="w-full">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-0 ml-4">
                        {[
                            { id: 'full-stack', label: 'Full Stack App', icon: <Box className="w-4 h-4" /> },
                            { id: 'mobile-app', label: 'Mobile App', icon: <Smartphone className="w-4 h-4" /> },
                            { id: 'landing-page', label: 'Landing Page', icon: <Layout className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm transition-colors border-t border-x border-white/10 ${activeTab === tab.id
                                    ? 'bg-gray-800/80 text-white border-b-0'
                                    : 'bg-black/40 text-gray-400 border-b border-white/10 hover:bg-gray-800/50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Input Area */}
                    <div className="bg-gray-900/30 border border-white/10 rounded-2xl p-4 backdrop-blur-sm relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Build me a beautiful landing page for..."
                            className="w-full h-32 bg-transparent border-none resize-none focus:ring-0 text-lg placeholder:text-gray-500 text-gray-200"
                        />

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 px-2">
                                    <Mic className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 px-2">
                                    <Github className="w-5 h-5" />
                                </Button>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/10 text-sm text-gray-300 cursor-pointer hover:bg-black/60 transition-colors">
                                    <Sparkles className="w-4 h-4 text-orange-400" />
                                    Claude 3.5 Sonnet
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-full border border-white/10 text-sm text-gray-400">
                                    <Globe className="w-4 h-4" />
                                    Public
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 px-2">
                                    <RefreshCw className="w-5 h-5" /> {/* Using RefreshCw as a placeholder for the swap icon */}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 px-2">
                                    <Mic className="w-5 h-5" />
                                </Button>
                                <Button className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4 justify-center mt-6">
                        {quickStarts.map((item, idx) => (
                            <button key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 border border-white/5 hover:border-white/10 rounded-lg text-sm text-gray-400 transition-all">
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer/Showcase peek */}
                <div className="absolute bottom-8 flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-yellow-400">🛡️</span> Showcase
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs">Apps</span>
                </div>

            </main>
        </div>
    );
}
