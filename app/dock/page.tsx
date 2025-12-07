'use client';

import { useState } from 'react';
import { MacOSDock } from '@/components/ui/mac-os-dock';

const apps = [
    {
        id: 'finder',
        name: 'Finder',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/finder-2021-09-10.png'
    },
    {
        id: 'safari',
        name: 'Safari',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/safari-2021-09-10.png'
    },
    {
        id: 'messages',
        name: 'Messages',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/mail-2021-05-25.png?rf=1024'
    },
    {
        id: 'mail',
        name: 'Mail',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/mail-2021-09-10.png'
    },
    {
        id: 'maps',
        name: 'Maps',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/maps-2021-09-10.png'
    },
    {
        id: 'photos',
        name: 'Photos',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/photos-2021-09-10.png'
    },
    {
        id: 'facetime',
        name: 'FaceTime',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/facetime-2021-09-10.png'
    },
    {
        id: 'calendar',
        name: 'Calendar',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/calendar-2021-04-29.png?rf=1024'
    },
    {
        id: 'contacts',
        name: 'Contacts',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/contacts-2021-09-10.png'
    },
    {
        id: 'reminders',
        name: 'Reminders',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/reminders-2021-09-10.png'
    },
    {
        id: 'tv',
        name: 'TV',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/tv-2021-09-10.png'
    },
    {
        id: 'music',
        name: 'Music',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/music-2021-09-10.png'
    },
    {
        id: 'podcasts',
        name: 'Podcasts',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/podcasts-2021-09-10.png'
    },
    {
        id: 'appstore',
        name: 'App Store',
        icon: 'https://cdn.jim-nielsen.com/macos/1024/app-store-2021-09-10.png'
    }
];

export default function DockDemo() {
    const [openApps, setOpenApps] = useState(['finder', 'safari', 'music']);
    const [clickHistory, setClickHistory] = useState<string[]>([]);

    const handleAppClick = (appId: string) => {
        // Toggle app open/close
        setOpenApps(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );

        // Add to click history
        const appName = apps.find(app => app.id === appId)?.name || appId;
        setClickHistory(prev => [`${appName} clicked`, ...prev.slice(0, 4)]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex flex-col items-center justify-between p-8">
            {/* Header */}
            <div className="text-center space-y-4 mt-12">
                <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                    MacOS Dock Component
                </h1>
                <p className="text-xl text-white/90">
                    Hover over the icons to see the beautiful magnification effect
                </p>
            </div>

            {/* Info Panel */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-semibold text-white mb-4">
                    Click History
                </h2>
                {clickHistory.length === 0 ? (
                    <p className="text-white/70 italic">Click an app to get started!</p>
                ) : (
                    <ul className="space-y-2">
                        {clickHistory.map((item, index) => (
                            <li
                                key={index}
                                className="text-white/90 bg-white/5 rounded-lg px-4 py-2 border border-white/10"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-6 pt-4 border-t border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Currently Open Apps
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {openApps.length === 0 ? (
                            <p className="text-white/70 italic text-sm">No apps open</p>
                        ) : (
                            openApps.map(appId => {
                                const app = apps.find(a => a.id === appId);
                                return (
                                    <span
                                        key={appId}
                                        className="bg-white/20 text-white px-3 py-1 rounded-full text-sm border border-white/30"
                                    >
                                        {app?.name}
                                    </span>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Dock */}
            <div className="w-full">
                <MacOSDock
                    apps={apps}
                    onAppClick={handleAppClick}
                    openApps={openApps}
                />
            </div>
        </div>
    );
}
