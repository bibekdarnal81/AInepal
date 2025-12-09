'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Network, BarChart2, Gauge, Rocket } from 'lucide-react';

type TabId = 'deploy' | 'network' | 'scale' | 'monitor' | 'evolve';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    { id: 'deploy', label: 'Deploy', icon: <Cloud className="w-4 h-4" /> },
    { id: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
    { id: 'scale', label: 'Scale', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'monitor', label: 'Monitor', icon: <Gauge className="w-4 h-4" /> },
    { id: 'evolve', label: 'Evolve', icon: <Rocket className="w-4 h-4" /> },
];

// Tab button with progress indicator
const TabButton = ({
    tab,
    isActive,
    progress,
    onClick
}: {
    tab: Tab;
    isActive: boolean;
    progress: number;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className="relative flex flex-col gap-3 pt-4 focus:outline-none focus-visible:bg-gray-100/5 rounded-t min-w-[100px]"
    >
        <div className="flex gap-2 items-center justify-center px-4">
            <div className={`text-lg ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
                {tab.icon}
            </div>
            <p className={`text-sm font-medium ${isActive ? 'text-pink-600' : 'text-gray-500'}`}>
                {tab.label}
            </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full rounded-sm overflow-hidden">
            <div className={`absolute inset-0 ${isActive ? 'bg-gray-700 h-2' : 'bg-gray-800 h-0.5 top-[3px]'}`} />
            {isActive && (
                <motion.div
                    className="bg-pink-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                />
            )}
        </div>
    </button>
);

// Network Diagram SVG Content
const NetworkDiagram = () => (
    <svg viewBox="0 0 1442 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-5xl mx-auto">
        {/* Background */}
        <rect x={1} y={1} width={1440} height={798} rx={8} fill="#0D0C14" />
        <rect x={0.5} y={0.5} width={1441} height={799} rx={8.5} stroke="white" strokeOpacity={0.125} />

        {/* Dot grid pattern */}
        <defs>
            <pattern id="dotPattern" width={24} height={24} patternUnits="userSpaceOnUse">
                <circle cx={1} cy={1} r={1} fill="white" fillOpacity={0.09} />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotPattern)" />

        {/* Header */}
        <g>
            <rect x={1} y={1} width={1440} height={60} fill="#0D0C14" />
            <rect x={1} y={60} width={1440} height={1} fill="white" fillOpacity={0.075} />

            {/* Logo and breadcrumb */}
            <path fillRule="evenodd" clipRule="evenodd" d="M26.7858 24.1261C29.1921 19.8755 33.7487 17 38.9851 17C46.7255 17 53.0003 23.2714 53 31.006C52.9986 32.499 52.7577 33.9821 52.2864 35.3989H25.7457C25.5721 34.8573 25.4564 34.3666 25.4564 34.3666H44.8997C46.1419 34.3666 47.1678 33.731 47.6445 32.6654C48.1625 31.506 47.9433 30.2958 47.1815 29.2431C46.3575 28.105 44.9751 26.5074 44.0176 25.7836C42.2538 24.4491 40.012 24.2533 38.1882 24.1925L37.6646 24.1732C37.6113 24.1709 37.5606 24.1688 37.5115 24.1667C36.7821 24.1355 36.385 24.1185 32.3294 24.1185V24.1199H32.3285C32.3285 24.1199 28.6663 24.1222 26.7858 24.1261ZM25 30.3912C25.0199 29.9194 25.0633 29.4488 25.1301 28.9813H36.3093V27.562H25.4109C25.5388 26.9823 25.8015 26.2698 26.0738 25.5347C28.1776 25.5291 30.3381 25.524 32.3253 25.524C36.0383 25.524 36.6709 25.5395 37.6037 25.5778C37.8573 25.5886 38.104 25.5951 38.3457 25.6015C40.7699 25.6653 42.687 25.7157 45.9933 29.9873C46.0939 30.1153 46.1937 30.2461 46.2679 30.3912H25ZM25.0109 31.812H46.4356C46.2752 32.4328 45.7817 32.9331 44.8999 32.9331H25.1197C25.0687 32.5644 25.0334 32.1907 25.0109 31.812ZM38.9852 45C29.5101 44.857 26.2309 36.8052 26.2309 36.8052H51.7249C49.5145 41.6366 44.6485 45 38.9852 45Z" fill="#F7F7F8" />

            <text fill="#535260" fontFamily="Inter" fontSize={16} fontWeight={500}>
                <tspan x={67} y={36}>/</tspan>
            </text>
            <text fill="#F7F7F8" fontFamily="Inter" fontSize={16} fontWeight={500}>
                <tspan x={77} y={36}>gravy-truck</tspan>
            </text>
            <text fill="#535260" fontFamily="Inter" fontSize={16} fontWeight={500}>
                <tspan x={175} y={36}>/</tspan>
            </text>
            <text fill="#F7F7F8" fontFamily="Inter" fontSize={16} fontWeight={500}>
                <tspan x={185} y={36}>production</tspan>
            </text>

            {/* Nav items */}
            <text fill="#F7F7F8" fontFamily="Inter" fontSize={14} fontWeight={500}>
                <tspan x={900} y={36}>Architecture</tspan>
            </text>
            <text fill="#868593" fontFamily="Inter" fontSize={14} fontWeight={500}>
                <tspan x={1010} y={36}>Observability</tspan>
            </text>
            <text fill="#868593" fontFamily="Inter" fontSize={14} fontWeight={500}>
                <tspan x={1120} y={36}>Logs</tspan>
            </text>
            <text fill="#868593" fontFamily="Inter" fontSize={14} fontWeight={500}>
                <tspan x={1170} y={36}>Settings</tspan>
            </text>

            {/* Avatar */}
            <circle cx={1380} cy={31} r={12} fill="url(#avatarGradient)" />
            <defs>
                <linearGradient id="avatarGradient" x1={1368} y1={19} x2={1392} y2={43}>
                    <stop stopColor="#7E28BC" />
                    <stop offset={1} stopColor="#531AFF" />
                </linearGradient>
            </defs>
        </g>

        {/* Backend Service Card */}
        <g transform="translate(577, 280)">
            <rect x={0.5} y={0.5} width={287} height={143} rx={11.5} fill="#181622" stroke="#33323E" />

            {/* GitHub icon */}
            <circle cx={26} cy={32} r={12} fill="#F7F7F8" fillOpacity={0.1} />
            <path fillRule="evenodd" clipRule="evenodd" d="M26 20C19.37 20 14 25.37 14 32C14 37.31 17.435 41.795 22.205 43.385C22.705 43.49 22.905 43.19 22.905 42.93C22.905 42.7 22.89 41.96 22.89 41.18C19.5 41.79 18.84 40.14 18.64 39.27C18.52 38.82 18 37.76 17.55 37.52C17.18 37.32 16.66 36.72 17.54 36.7C18.38 36.68 18.98 37.48 19.18 37.8C20.14 39.44 21.68 38.79 22.94 38.52C23.04 37.82 23.32 37.35 23.62 37.08C21.18 36.8 18.64 35.85 18.64 31.43C18.64 30.26 19.07 29.29 19.21 28.69C19.1 28.42 18.74 27.31 19.32 25.84C19.32 25.84 20.24 25.55 22.91 26.94C23.79 26.69 24.72 26.57 25.65 26.57C26.58 26.57 27.51 26.69 28.39 26.94C31.06 25.54 31.99 25.84 31.99 25.84C32.57 27.31 32.21 28.42 32.1 28.69C32.7 29.29 33.12 30.25 33.12 31.43C33.12 35.86 30.56 36.8 28.12 37.08C28.51 37.42 28.85 38.08 28.85 39.11C28.85 40.58 28.84 41.77 28.84 42.93C28.84 43.19 29.04 43.5 29.54 43.38C34.29 41.79 37.71 37.3 37.71 32C37.71 25.37 32.34 20 25.71 20H26Z" fill="#F7F7F8" />

            <text fill="#F7F7F8" fontFamily="Inter" fontSize={16} fontWeight={600}>
                <tspan x={50} y={38}>backend</tspan>
            </text>

            {/* Status */}
            <circle cx={26} cy={95} r={8} stroke="#42946E" strokeWidth={1.5} fill="none" />
            <path d="M22 95L25 98L30 92" stroke="#42946E" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <text fill="#868593" fontFamily="Inter" fontSize={14}>
                <tspan x={50} y={100}>Just deployed via GitHub</tspan>
            </text>
        </g>

        {/* Postgres Service Card */}
        <g transform="translate(577, 450)">
            <rect x={0.5} y={0.5} width={287} height={143} rx={11.5} fill="#161D1A" stroke="#1C362A" />

            {/* Postgres icon placeholder */}
            <rect x={14} y={20} width={24} height={24} rx={4} fill="#336791" fillOpacity={0.2} />
            <text fill="#F7F7F8" fontFamily="Inter" fontSize={16} fontWeight={600}>
                <tspan x={50} y={38}>postgres</tspan>
            </text>

            {/* New badge */}
            <rect x={226} y={12} width={40} height={24} rx={4} fill="#1C362A" />
            <text fill="#72C09C" fontFamily="Inter" fontSize={12} fontWeight={500}>
                <tspan x={233} y={28}>New</tspan>
            </text>

            {/* Status */}
            <path d="M22 95L25 98L30 92" stroke="#367859" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <text fill="#868593" fontFamily="Inter" fontSize={14}>
                <tspan x={50} y={100}>Ready to be deployed</tspan>
            </text>

            {/* Disk attachment */}
            <rect x={0} y={120} width={288} height={72} rx={0} fill="#161D1A" stroke="#1C362A" strokeWidth={1} />
            <text fill="#868593" fontFamily="Inter" fontSize={14}>
                <tspan x={50} y={160}>pg-data</tspan>
            </text>
        </g>

        {/* Left sidebar controls */}
        <g transform="translate(25, 85)">
            <rect x={0.5} y={0.5} width={33} height={33} rx={5.5} stroke="#33323E" fill="#0D0C14" />

            {/* Zoom controls */}
            <rect x={0.5} y={47} width={33} height={102} rx={5.5} fill="#0D0C14" stroke="#33323E" />
            <text fill="#A1A0AB" fontFamily="Inter" fontSize={20} fontWeight={300}>
                <tspan x={14} y={85}>+</tspan>
            </text>
            <rect x={0} y={100} width={34} height={1} fill="#33323E" />
            <text fill="#A1A0AB" fontFamily="Inter" fontSize={20} fontWeight={300}>
                <tspan x={14} y={125}>−</tspan>
            </text>
        </g>

        {/* Right side buttons */}
        <g transform="translate(1200, 85)">
            <rect x={0.5} y={0.5} width={82} height={33} rx={5.5} fill="#0D0C14" stroke="#33323E" />
            <text fill="#F7F7F8" fontFamily="Inter" fontSize={14}>
                <tspan x={28} y={22}>Sync</tspan>
            </text>

            <rect x={91.5} y={0.5} width={94} height={33} rx={5.5} fill="#0D0C14" stroke="#33323E" />
            <text fill="#F7F7F8" fontFamily="Inter" fontSize={14}>
                <tspan x={128} y={22}>Create</tspan>
            </text>
        </g>

        {/* Bottom activity tab */}
        <g transform="translate(1097, 730)">
            <rect x={0} y={0} width={320} height={48} rx={8} fill="#13111C" stroke="white" strokeOpacity={0.075} />
            <text fill="#F7F7F8" fontFamily="Inter" fontSize={14}>
                <tspan x={60} y={29}>Activity</tspan>
            </text>
            <path d="M292 27L288 23L284 27" stroke="#868593" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </svg>
);

// Simple placeholder for other tabs
const TabContent = ({ tabId }: { tabId: TabId }) => {
    switch (tabId) {
        case 'deploy':
            return (
                <div className="flex items-center justify-center h-[500px] text-gray-400">
                    <div className="text-center">
                        <Cloud className="w-16 h-16 mx-auto mb-4 text-pink-500/50" />
                        <p className="text-lg">Deploy your services with one click</p>
                    </div>
                </div>
            );
        case 'network':
            return <NetworkDiagram />;
        case 'scale':
            return (
                <div className="flex items-center justify-center h-[500px] text-gray-400">
                    <div className="text-center">
                        <BarChart2 className="w-16 h-16 mx-auto mb-4 text-pink-500/50" />
                        <p className="text-lg">Scale your infrastructure automatically</p>
                    </div>
                </div>
            );
        case 'monitor':
            return (
                <div className="flex items-center justify-center h-[500px] text-gray-400">
                    <div className="text-center">
                        <Gauge className="w-16 h-16 mx-auto mb-4 text-pink-500/50" />
                        <p className="text-lg">Monitor performance in real-time</p>
                    </div>
                </div>
            );
        case 'evolve':
            return (
                <div className="flex items-center justify-center h-[500px] text-gray-400">
                    <div className="text-center">
                        <Rocket className="w-16 h-16 mx-auto mb-4 text-pink-500/50" />
                        <p className="text-lg">Evolve with PR environments</p>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

export function PlatformTabsSection() {
    const [activeTab, setActiveTab] = useState<TabId>('network');
    const [progress, setProgress] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const TAB_DURATION = 8000; // 8 seconds per tab

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    // Move to next tab
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    const nextIndex = (currentIndex + 1) % tabs.length;
                    setActiveTab(tabs[nextIndex].id);
                    return 0;
                }
                return prev + (100 / (TAB_DURATION / 100));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [activeTab, isAutoPlaying]);

    const handleTabClick = (tabId: TabId) => {
        setActiveTab(tabId);
        setProgress(0);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds of inactivity
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <section className="relative py-32 px-6 bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Tab buttons */}
                <div className="w-full grid grid-cols-5 gap-1 mb-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <TabButton
                            key={tab.id}
                            tab={tab}
                            isActive={activeTab === tab.id}
                            progress={activeTab === tab.id ? progress : 0}
                            onClick={() => handleTabClick(tab.id)}
                        />
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <TabContent tabId={activeTab} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
