"use client";

import React from 'react';
import { RefreshCw, ExternalLink, Smartphone, Monitor } from 'lucide-react';

export function PreviewPane() {
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Address Bar */}
            <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                    <RefreshCw className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 truncate">
                    http://localhost:3000
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                    <button className="p-1 hover:bg-gray-200 rounded"><Smartphone className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-black"><Monitor className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Content Iframe Placeholder */}
            <div className="flex-1 bg-white relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <p>App Preview</p>
                        <p className="text-xs">Loading...</p>
                    </div>
                </div>
                {/* 
                In a real app, this would be an iframe pointing to the user's generated app. 
                For the mockup, we simulate a simple page. 
             */}
                <div className="absolute inset-2 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center">
                    <div className="p-8 bg-blue-50 text-blue-900 rounded-xl shadow-sm text-center">
                        <h1 className="text-2xl font-bold mb-2">Hello World</h1>
                        <p>This is a live preview of your app.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
