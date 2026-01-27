"use client";

import React, { useState } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatInterface() {
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Hi! I am your AI builder. What shall we build today?' },

        { role: 'system', content: 'Sure! I have set up a basic landing page/hero section for you. Check the preview to the right.' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', content: input }]);
        setInput('');
        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'system', content: 'I am processing your request...' }]);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] border-r border-white/5">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'system' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                            {msg.role === 'system' ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.role === 'system' ? 'bg-white/10 text-gray-200' : 'bg-blue-600/20 text-blue-100 border border-blue-500/30'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-white/5 bg-[#1e1e1e]">
                <div className="relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask AI to change something..."
                        className="pr-10 bg-black/30 border-white/10 focus-visible:ring-blue-500"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-md transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
