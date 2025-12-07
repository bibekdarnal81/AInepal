'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface DockApp {
    id: string;
    name: string;
    icon: string;
}

interface MacOSDockProps {
    apps: DockApp[];
    onAppClick?: (appId: string) => void;
    openApps?: string[];
    className?: string;
}

export function MacOSDock({ apps, onAppClick, openApps = [], className }: MacOSDockProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mouseX, setMouseX] = useState<number | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseLeave = () => {
            setHoveredIndex(null);
            setMouseX(null);
        };

        const dockElement = dockRef.current;
        if (dockElement) {
            dockElement.addEventListener('mouseleave', handleMouseLeave);
            return () => dockElement.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (dockRef.current) {
            const rect = dockRef.current.getBoundingClientRect();
            setMouseX(e.clientX - rect.left);
        }
    };

    const getIconScale = (index: number) => {
        if (hoveredIndex === null || mouseX === null) return 1;

        const icons = dockRef.current?.querySelectorAll('.dock-icon');
        if (!icons || !icons[index]) return 1;

        const iconRect = icons[index].getBoundingClientRect();
        const dockRect = dockRef.current?.getBoundingClientRect();

        if (!dockRect) return 1;

        const iconCenter = iconRect.left - dockRect.left + iconRect.width / 2;
        const distance = Math.abs(mouseX - iconCenter);
        const maxDistance = 150;

        if (distance > maxDistance) return 1;

        const scale = 1 + (1 - distance / maxDistance) * 0.7;
        return Math.min(scale, 1.7);
    };

    const getIconTranslateY = (index: number) => {
        if (hoveredIndex === null || mouseX === null) return 0;

        const icons = dockRef.current?.querySelectorAll('.dock-icon');
        if (!icons || !icons[index]) return 0;

        const iconRect = icons[index].getBoundingClientRect();
        const dockRect = dockRef.current?.getBoundingClientRect();

        if (!dockRect) return 0;

        const iconCenter = iconRect.left - dockRect.left + iconRect.width / 2;
        const distance = Math.abs(mouseX - iconCenter);
        const maxDistance = 150;

        if (distance > maxDistance) return 0;

        const translateY = -((1 - distance / maxDistance) * 20);
        return translateY;
    };

    return (
        <div className={cn('flex justify-center items-end p-4', className)}>
            <div
                ref={dockRef}
                onMouseMove={handleMouseMove}
                className="flex items-end gap-2 px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
                style={{ height: '80px' }}
            >
                {apps.map((app, index) => {
                    const isOpen = openApps.includes(app.id);
                    const scale = getIconScale(index);
                    const translateY = getIconTranslateY(index);

                    return (
                        <div
                            key={app.id}
                            className="flex flex-col items-center gap-1 relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                        >
                            <button
                                onClick={() => onAppClick?.(app.id)}
                                className="dock-icon relative transition-all duration-200 ease-out focus:outline-none group"
                                style={{
                                    transform: `scale(${scale}) translateY(${translateY}px)`,
                                    transformOrigin: 'bottom center',
                                }}
                            >
                                <img
                                    src={app.icon}
                                    alt={app.name}
                                    className="w-12 h-12 rounded-xl transition-all duration-200"
                                    draggable={false}
                                />

                                {/* Tooltip */}
                                <div
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800/90 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                    style={{
                                        opacity: scale > 1.2 ? 1 : 0,
                                    }}
                                >
                                    {app.name}
                                </div>
                            </button>

                            {/* Running indicator dot */}
                            {isOpen && (
                                <div className="w-1 h-1 bg-white rounded-full absolute -bottom-1" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
