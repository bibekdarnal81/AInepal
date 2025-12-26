'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Network, BarChart2, Gauge, Rocket } from 'lucide-react';
import Link from 'next/link';

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
        className="relative flex flex-col gap-3 pt-4 focus:outline-none rounded-t min-w-[80px] md:min-w-[100px]"
    >
        <div className="flex gap-2 items-center justify-center px-2 md:px-4">
            <div className={`text-lg ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
                {tab.icon}
            </div>
            <p className={`text-xs md:text-sm font-medium ${isActive ? 'text-pink-600' : 'text-gray-500'}`}>
                {tab.label}
            </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full rounded-sm overflow-hidden">
            <div className={`absolute inset-0 ${isActive ? 'bg-gray-200/20 h-2' : 'bg-gray-200/10 h-0.5 top-[3px]'}`} />
            {isActive && (
                <motion.div
                    className="bg-pink-500 h-full absolute left-0 top-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                />
            )}
        </div>
    </button>
);

// Deploy Tab Content - Build logs animation
const DeployContent = () => (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-[#0D0C14]">
        <svg viewBox="0 0 1442 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {/* Background */}
            <rect width="1442" height="800" fill="#0D0C14" />

            {/* Dot pattern */}
            <defs>
                <pattern id="dotPatternDeploy" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.06" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPatternDeploy)" />

            {/* Panel */}
            <rect x="457" y="85" width="984" height="715" rx="12" fill="#13111C" stroke="white" strokeOpacity="0.075" />

            {/* Build Logs Panel */}
            <rect x="481" y="85" width="960" height="715" rx="8" fill="#181622" stroke="#33323E" />

            {/* Panel Header */}
            <g>
                {/* GitHub icon + service name */}
                <circle cx="530" cy="140" r="12" fill="#F7F7F8" fillOpacity="0.1" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="20" fontWeight="600">
                    <tspan x="554" y="147">backend</tspan>
                </text>
                <text fill="#535260" fontFamily="Inter" fontSize="16">
                    <tspan x="644" y="147">/</tspan>
                </text>
                <text fill="#F7F7F8" fontFamily="monospace" fontSize="16">
                    <tspan x="658" y="147">23rr2v9</tspan>
                </text>

                {/* Date */}
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="1180" y="147">Nov 12, 2024 - 9:11 AM</tspan>
                </text>
            </g>

            {/* Status badge */}
            <rect x="530" y="170" width="92" height="27" rx="13.5" fill="#0F1B33" stroke="#1D4596" />
            <text fill="#5E8EED" fontFamily="Inter" fontSize="12" fontWeight="600">
                <tspan x="542" y="188">DEPLOYING</tspan>
            </text>
            <text fill="#868593" fontFamily="Inter" fontSize="16">
                <tspan x="635" y="189">Deploying › Creating Containers</tspan>
            </text>

            {/* Tabs */}
            <g transform="translate(530, 230)">
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="0" y="15">Details</tspan>
                </text>
                <rect x="62" y="0" width="94" height="34" rx="6" fill="white" fillOpacity="0.075" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="14" fontWeight="500">
                    <tspan x="74" y="22">Build Logs</tspan>
                </text>
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="172" y="15">Deploy Logs</tspan>
                </text>
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="282" y="15">HTTP Logs</tspan>
                </text>
            </g>

            {/* Log content area */}
            <rect x="481" y="290" width="960" height="510" fill="#13111C" />

            {/* Log lines */}
            <g transform="translate(529, 310)">
                {/* Timestamps column */}
                <rect width="4" height="20" fill="#1D4596" rx="1" />
                <rect y="24" width="4" height="20" fill="#1D4596" rx="1" />
                <rect y="48" width="4" height="20" fill="#1D4596" rx="1" />
                <rect y="72" width="4" height="20" fill="#1D4596" rx="1" />
                <rect y="96" width="4" height="20" fill="#1D4596" rx="1" />
                <rect y="120" width="4" height="20" fill="#1D4596" rx="1" />
                <rect y="144" width="4" height="20" fill="#1D4596" rx="1" />
                <rect y="168" width="4" height="20" fill="#1D4596" rx="1" />

                <text fill="#868593" fontFamily="monospace" fontSize="12">
                    <tspan x="16" y="14">Nov 12 00:00:00</tspan>
                    <tspan x="16" y="38">Nov 12 00:00:10</tspan>
                    <tspan x="16" y="62">Nov 12 00:00:20</tspan>
                    <tspan x="16" y="86">Nov 12 00:00:30</tspan>
                    <tspan x="16" y="110">Nov 12 00:00:40</tspan>
                    <tspan x="16" y="134">Nov 12 00:00:50</tspan>
                    <tspan x="16" y="158">Nov 12 00:01:00</tspan>
                    <tspan x="16" y="182">Nov 12 00:01:10</tspan>
                </text>

                <text fill="#F7F7F8" fontFamily="monospace" fontSize="12">
                    <tspan x="160" y="14">============================</tspan>
                    <tspan x="160" y="38">Starting Build with Nixpacks</tspan>
                    <tspan x="160" y="62">============================</tspan>
                    <tspan x="160" y="86">#3 [stage-0 1/12] FROM ghcr.io/railwayapp/nixpacks...</tspan>
                    <tspan x="160" y="110">#3 resolve ghcr.io/railwayapp/nixpacks:ubuntu</tspan>
                    <tspan x="160" y="134">#3 DONE 0.0s</tspan>
                    <tspan x="160" y="158">#4 [stage-0 2/12] WORKDIR /app/</tspan>
                    <tspan x="160" y="182">#4 CACHED</tspan>
                </text>
            </g>

            {/* Service card on left */}
            <g transform="translate(97, 426)">
                <rect width="288" height="144" rx="12" fill="#181622" stroke="#33323E" />
                <circle cx="38" cy="50" r="12" fill="#F7F7F8" fillOpacity="0.1" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="600">
                    <tspan x="60" y="56">backend</tspan>
                </text>
                {/* Loader icon */}
                <circle cx="38" cy="105" r="8" stroke="#5E8EED" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="60" y="110">Deploying...</tspan>
                </text>
            </g>

            {/* Toast notification */}
            <g transform="translate(1097, 700)">
                <rect width="320" height="80" rx="8" fill="#201F2D" stroke="white" strokeOpacity="0.075" />
                <circle cx="34" cy="40" r="10" stroke="#868593" strokeWidth="1.5" fill="none" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="500">
                    <tspan x="60" y="35">Starting deployment...</tspan>
                </text>
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="60" y="55">backend deployment started!</tspan>
                </text>
            </g>
        </svg>
    </div>
);

// Network Tab Content
const NetworkContent = () => (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-[#0D0C14]">
        <svg viewBox="0 0 1442 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <rect width="1442" height="800" fill="#0D0C14" />

            <defs>
                <pattern id="dotPatternNetwork" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.06" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPatternNetwork)" />

            {/* Header */}
            <rect y="0" width="1442" height="62" fill="#0D0C14" />
            <rect y="61" width="1442" height="1" fill="white" fillOpacity="0.075" />

            {/* Logo */}
            <circle cx="39" cy="31" r="14" fill="#F7F7F8" fillOpacity="0.1" />
            <text fill="#535260" fontFamily="Inter" fontSize="16">
                <tspan x="67" y="36">/</tspan>
            </text>
            <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="500">
                <tspan x="77" y="36">gravy-truck</tspan>
            </text>
            <text fill="#535260" fontFamily="Inter" fontSize="16">
                <tspan x="175" y="36">/</tspan>
            </text>
            <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="500">
                <tspan x="185" y="36">production</tspan>
            </text>

            {/* Backend card */}
            <g transform="translate(577, 300)">
                <rect width="288" height="144" rx="12" fill="#181622" stroke="#33323E" />
                <circle cx="38" cy="42" r="12" fill="#F7F7F8" fillOpacity="0.1" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="600">
                    <tspan x="60" y="48">backend</tspan>
                </text>
                <circle cx="38" cy="100" r="8" stroke="#42946E" strokeWidth="1.5" fill="none" />
                <path d="M34 100L37 103L42 97" stroke="#42946E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="60" y="105">Just deployed via GitHub</tspan>
                </text>
            </g>

            {/* Postgres card */}
            <g transform="translate(577, 480)">
                <rect width="288" height="144" rx="12" fill="#161D1A" stroke="#1C362A" />
                <rect x="226" y="12" width="40" height="24" rx="4" fill="#1C362A" />
                <text fill="#72C09C" fontFamily="Inter" fontSize="12" fontWeight="500">
                    <tspan x="233" y="28">New</tspan>
                </text>
                <circle cx="38" cy="42" r="12" fill="#336791" fillOpacity="0.2" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="600">
                    <tspan x="60" y="48">postgres</tspan>
                </text>
                <path d="M34 100L37 103L42 97" stroke="#367859" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="60" y="105">Ready to be deployed</tspan>
                </text>

                {/* Disk attachment */}
                <rect y="120" width="288" height="48" fill="#161D1A" stroke="#1C362A" />
                <text fill="#868593" fontFamily="Inter" fontSize="14">
                    <tspan x="60" y="148">pg-data</tspan>
                </text>
            </g>

            {/* Control buttons */}
            <g transform="translate(25, 85)">
                <rect width="34" height="34" rx="6" fill="#0D0C14" stroke="#33323E" />
                <rect y="47" width="34" height="102" rx="6" fill="#0D0C14" stroke="#33323E" />
                <text fill="#A1A0AB" fontFamily="Inter" fontSize="20" fontWeight="300">
                    <tspan x="12" y="82">+</tspan>
                </text>
                <rect y="81" width="34" height="1" fill="#33323E" />
                <text fill="#A1A0AB" fontFamily="Inter" fontSize="20" fontWeight="300">
                    <tspan x="14" y="117">−</tspan>
                </text>
            </g>

            {/* Right buttons */}
            <g transform="translate(1231, 85)">
                <rect width="82" height="34" rx="6" fill="#0D0C14" stroke="#33323E" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="14">
                    <tspan x="28" y="22">Sync</tspan>
                </text>
                <rect x="91" width="94" height="34" rx="6" fill="#0D0C14" stroke="#33323E" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="14">
                    <tspan x="125" y="22">Create</tspan>
                </text>
            </g>

            {/* Activity bar */}
            <g transform="translate(1097, 730)">
                <rect width="320" height="48" rx="8" fill="#13111C" stroke="white" strokeOpacity="0.075" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="14">
                    <tspan x="60" y="29">Activity</tspan>
                </text>
            </g>
        </svg>
    </div>
);

// Scale Tab Content
const ScaleContent = () => (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-[#0D0C14]">
        <svg viewBox="0 0 1442 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <rect width="1442" height="800" fill="#0D0C14" />
            <defs>
                <pattern id="dotPatternScale" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.06" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPatternScale)" />

            {/* Scaling visualization */}
            <g transform="translate(400, 200)">
                {/* Multiple replica cards */}
                {[0, 1, 2].map((i) => (
                    <g key={i} transform={`translate(${i * 220}, 0)`}>
                        <rect width="200" height="120" rx="8" fill="#181622" stroke="#33323E" />
                        <text fill="#F7F7F8" fontFamily="Inter" fontSize="14" fontWeight="500">
                            <tspan x="20" y="40">backend-{i + 1}</tspan>
                        </text>
                        <text fill="#42946E" fontFamily="Inter" fontSize="12">
                            <tspan x="20" y="70">● Running</tspan>
                        </text>
                        <text fill="#868593" fontFamily="Inter" fontSize="12">
                            <tspan x="20" y="95">CPU: 24% | Mem: 128MB</tspan>
                        </text>
                    </g>
                ))}
            </g>

            {/* Auto-scaling indicator */}
            <g transform="translate(500, 400)">
                <rect width="400" height="200" rx="12" fill="#181622" stroke="#33323E" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="18" fontWeight="600">
                    <tspan x="30" y="50">Horizontal Auto-Scaling</tspan>
                </text>
                {/* Chart bars */}
                <rect x="30" y="80" width="40" height="60" rx="4" fill="#853BCE" fillOpacity="0.3" />
                <rect x="80" y="100" width="40" height="40" rx="4" fill="#853BCE" fillOpacity="0.5" />
                <rect x="130" y="70" width="40" height="70" rx="4" fill="#853BCE" fillOpacity="0.7" />
                <rect x="180" y="90" width="40" height="50" rx="4" fill="#853BCE" />
                <rect x="230" y="60" width="40" height="80" rx="4" fill="#42946E" />
                <text fill="#868593" fontFamily="Inter" fontSize="12">
                    <tspan x="30" y="170">Instances scale based on CPU & memory</tspan>
                </text>
            </g>
        </svg>
    </div>
);

// Monitor Tab Content
const MonitorContent = () => (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-[#0D0C14]">
        <svg viewBox="0 0 1442 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <rect width="1442" height="800" fill="#0D0C14" />
            <defs>
                <pattern id="dotPatternMonitor" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.06" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPatternMonitor)" />

            {/* Metrics dashboard */}
            <g transform="translate(100, 100)">
                {/* CPU Usage */}
                <rect width="400" height="200" rx="12" fill="#181622" stroke="#33323E" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="600">
                    <tspan x="20" y="40">CPU Usage</tspan>
                </text>
                <path d="M20,150 Q100,80 180,120 T340,90" stroke="#853BCE" strokeWidth="2" fill="none" />
                <text fill="#853BCE" fontFamily="Inter" fontSize="24" fontWeight="600">
                    <tspan x="320" y="50">24%</tspan>
                </text>
            </g>

            <g transform="translate(520, 100)">
                {/* Memory Usage */}
                <rect width="400" height="200" rx="12" fill="#181622" stroke="#33323E" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="600">
                    <tspan x="20" y="40">Memory Usage</tspan>
                </text>
                <path d="M20,140 Q80,100 160,110 T340,80" stroke="#42946E" strokeWidth="2" fill="none" />
                <text fill="#42946E" fontFamily="Inter" fontSize="24" fontWeight="600">
                    <tspan x="300" y="50">512MB</tspan>
                </text>
            </g>

            <g transform="translate(940, 100)">
                {/* Requests */}
                <rect width="400" height="200" rx="12" fill="#181622" stroke="#33323E" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="600">
                    <tspan x="20" y="40">Requests/min</tspan>
                </text>
                <path d="M20,130 L80,110 L140,140 L200,90 L260,120 L320,70" stroke="#5E8EED" strokeWidth="2" fill="none" />
                <text fill="#5E8EED" fontFamily="Inter" fontSize="24" fontWeight="600">
                    <tspan x="300" y="50">2.4k</tspan>
                </text>
            </g>

            {/* Logs panel */}
            <g transform="translate(100, 350)">
                <rect width="1240" height="350" rx="12" fill="#181622" stroke="#33323E" />
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="16" fontWeight="600">
                    <tspan x="20" y="40">Recent Logs</tspan>
                </text>
                <text fill="#868593" fontFamily="monospace" fontSize="12">
                    <tspan x="20" y="80">[INFO] 2024-11-12 09:11:15 - Server started on port 3000</tspan>
                    <tspan x="20" y="105">[INFO] 2024-11-12 09:11:16 - Database connection established</tspan>
                    <tspan x="20" y="130">[INFO] 2024-11-12 09:11:18 - Redis cache connected</tspan>
                    <tspan x="20" y="155">[INFO] 2024-11-12 09:11:20 - Health check passed</tspan>
                </text>
            </g>
        </svg>
    </div>
);

// Evolve Tab Content
const EvolveContent = () => (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-[#0D0C14]">
        <svg viewBox="0 0 1442 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <rect width="1442" height="800" fill="#0D0C14" />
            <defs>
                <pattern id="dotPatternEvolve" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.06" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPatternEvolve)" />

            {/* Production environment */}
            <g transform="translate(50, 100)">
                <rect width="640" height="600" rx="12" fill="#181622" stroke="#1C362A" />
                <rect x="20" y="20" width="120" height="30" rx="6" fill="#1C362A" />
                <text fill="#72C09C" fontFamily="Inter" fontSize="12" fontWeight="500">
                    <tspan x="35" y="40">production</tspan>
                </text>

                {/* Branch info */}
                <text fill="#868593" fontFamily="Inter" fontSize="11">
                    <tspan x="160" y="40">main · v2.4.1</tspan>
                </text>

                {/* Service cards row 1 */}
                <g transform="translate(20, 70)">
                    <rect width="190" height="95" rx="6" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="25" cy="30" r="10" fill="#F7F7F8" fillOpacity="0.1" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">frontend</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">3 replicas · 256MB</tspan>
                    </text>
                </g>
                <g transform="translate(225, 70)">
                    <rect width="190" height="95" rx="6" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="25" cy="30" r="10" fill="#F7F7F8" fillOpacity="0.1" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">api</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">5 replicas · 512MB</tspan>
                    </text>
                </g>
                <g transform="translate(430, 70)">
                    <rect width="190" height="95" rx="6" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="25" cy="30" r="10" fill="#336791" fillOpacity="0.3" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">postgres</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">1 replica · 2GB</tspan>
                    </text>
                </g>

                {/* Service cards row 2 */}
                <g transform="translate(20, 180)">
                    <rect width="190" height="95" rx="6" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="25" cy="30" r="10" fill="#D82C20" fillOpacity="0.2" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">redis</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">1 replica · 128MB</tspan>
                    </text>
                </g>
                <g transform="translate(225, 180)">
                    <rect width="190" height="95" rx="6" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="25" cy="30" r="10" fill="#F7F7F8" fillOpacity="0.1" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">worker</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">2 replicas · 256MB</tspan>
                    </text>
                </g>
                <g transform="translate(430, 180)">
                    <rect width="190" height="95" rx="6" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="25" cy="30" r="10" fill="#F7F7F8" fillOpacity="0.1" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">cron</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">1 replica · 128MB</tspan>
                    </text>
                </g>

                {/* Version history */}
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="12" fontWeight="500">
                    <tspan x="20" y="310">Recent Deployments</tspan>
                </text>
                <g transform="translate(20, 325)">
                    <rect width="600" height="50" rx="4" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="20" cy="25" r="6" fill="#72C09C" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="11">
                        <tspan x="40" y="22">v2.4.1</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="10">
                        <tspan x="40" y="38">Deployed 2 hours ago · 23rr2v9</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="520" y="28">ACTIVE</tspan>
                    </text>
                </g>
                <g transform="translate(20, 385)">
                    <rect width="600" height="50" rx="4" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="20" cy="25" r="6" fill="#868593" />
                    <text fill="#868593" fontFamily="Inter" fontSize="11">
                        <tspan x="40" y="22">v2.4.0</tspan>
                    </text>
                    <text fill="#535260" fontFamily="Inter" fontSize="10">
                        <tspan x="40" y="38">Deployed 3 days ago · 1a2b3c4</tspan>
                    </text>
                </g>
                <g transform="translate(20, 445)">
                    <rect width="600" height="50" rx="4" fill="#161D1A" stroke="#1C362A" />
                    <circle cx="20" cy="25" r="6" fill="#868593" />
                    <text fill="#868593" fontFamily="Inter" fontSize="11">
                        <tspan x="40" y="22">v2.3.9</tspan>
                    </text>
                    <text fill="#535260" fontFamily="Inter" fontSize="10">
                        <tspan x="40" y="38">Deployed 1 week ago · 5d6e7f8</tspan>
                    </text>
                </g>
            </g>

            {/* Development environment */}
            <g transform="translate(750, 100)">
                <rect width="640" height="600" rx="12" fill="#181622" stroke="#1D4596" />
                <rect x="20" y="20" width="120" height="30" rx="6" fill="#0F1B33" />
                <text fill="#5E8EED" fontFamily="Inter" fontSize="12" fontWeight="500">
                    <tspan x="30" y="40">development</tspan>
                </text>

                {/* Branch info */}
                <text fill="#868593" fontFamily="Inter" fontSize="11">
                    <tspan x="160" y="40">feature/new-ui</tspan>
                </text>

                {/* PR Environment badge */}
                <g transform="translate(20, 65)">
                    <rect width="600" height="55" rx="6" fill="#0F1B33" stroke="#1D4596" />
                    <circle cx="25" cy="28" r="8" fill="#853BCE" fillOpacity="0.3" />
                    <text fill="#853BCE" fontFamily="Inter" fontSize="9" fontWeight="600">
                        <tspan x="20" y="30">PR</tspan>
                    </text>
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="12" fontWeight="500">
                        <tspan x="45" y="25">#142 - Add new dashboard UI</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="10">
                        <tspan x="45" y="42">Opened by @developer · 2 hours ago</tspan>
                    </text>
                    <rect x="480" y="15" width="100" height="26" rx="4" fill="#1D4596" />
                    <text fill="#5E8EED" fontFamily="Inter" fontSize="10" fontWeight="500">
                        <tspan x="500" y="32">View Preview</tspan>
                    </text>
                </g>

                {/* Service cards - forked */}
                <g transform="translate(20, 135)">
                    <rect width="190" height="95" rx="6" fill="#0F1B33" stroke="#1D4596" />
                    <circle cx="25" cy="30" r="10" fill="#F7F7F8" fillOpacity="0.1" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">frontend</tspan>
                    </text>
                    <text fill="#5E8EED" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Building...</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">Forked · Modified</tspan>
                    </text>
                </g>
                <g transform="translate(225, 135)">
                    <rect width="190" height="95" rx="6" fill="#0F1B33" stroke="#1D4596" />
                    <circle cx="25" cy="30" r="10" fill="#F7F7F8" fillOpacity="0.1" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">api</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">Forked · Unchanged</tspan>
                    </text>
                </g>
                <g transform="translate(430, 135)">
                    <rect width="190" height="95" rx="6" fill="#0F1B33" stroke="#1D4596" />
                    <circle cx="25" cy="30" r="10" fill="#336791" fillOpacity="0.3" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="13" fontWeight="500">
                        <tspan x="45" y="35">postgres</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="60">● Online</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="80">Shared from prod</tspan>
                    </text>
                </g>

                {/* Git changes panel */}
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="12" fontWeight="500">
                    <tspan x="20" y="265">Changed Files</tspan>
                </text>
                <g transform="translate(20, 280)">
                    <rect width="600" height="130" rx="6" fill="#0F1B33" stroke="#1D4596" />
                    <text fill="#72C09C" fontFamily="monospace" fontSize="10">
                        <tspan x="15" y="25">+ src/components/Dashboard.tsx</tspan>
                    </text>
                    <text fill="#72C09C" fontFamily="monospace" fontSize="10">
                        <tspan x="15" y="45">+ src/components/MetricsCard.tsx</tspan>
                    </text>
                    <text fill="#EAB308" fontFamily="monospace" fontSize="10">
                        <tspan x="15" y="65">M src/pages/index.tsx</tspan>
                    </text>
                    <text fill="#EAB308" fontFamily="monospace" fontSize="10">
                        <tspan x="15" y="85">M src/styles/globals.css</tspan>
                    </text>
                    <text fill="#868593" fontFamily="Inter" fontSize="10">
                        <tspan x="15" y="115">4 files changed, +312 -45 lines</tspan>
                    </text>
                </g>

                {/* Actions */}
                <g transform="translate(20, 430)">
                    <rect width="290" height="50" rx="6" fill="#1C362A" />
                    <text fill="#72C09C" fontFamily="Inter" fontSize="12" fontWeight="500">
                        <tspan x="80" y="30">✓ Merge to Production</tspan>
                    </text>
                </g>
                <g transform="translate(330, 430)">
                    <rect width="290" height="50" rx="6" fill="transparent" stroke="#1D4596" />
                    <text fill="#5E8EED" fontFamily="Inter" fontSize="12" fontWeight="500">
                        <tspan x="85" y="30">Request Review</tspan>
                    </text>
                </g>

                {/* Commit history */}
                <text fill="#F7F7F8" fontFamily="Inter" fontSize="12" fontWeight="500">
                    <tspan x="20" y="510">Recent Commits</tspan>
                </text>
                <g transform="translate(20, 525)">
                    <circle cx="10" cy="15" r="4" fill="#5E8EED" />
                    <text fill="#F7F7F8" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="12">Add new dashboard component</tspan>
                    </text>
                    <text fill="#535260" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="26">2 hours ago</tspan>
                    </text>
                </g>
                <g transform="translate(20, 560)">
                    <circle cx="10" cy="15" r="4" fill="#868593" />
                    <text fill="#868593" fontFamily="Inter" fontSize="10">
                        <tspan x="25" y="12">Update styling for metrics cards</tspan>
                    </text>
                    <text fill="#535260" fontFamily="Inter" fontSize="9">
                        <tspan x="25" y="26">3 hours ago</tspan>
                    </text>
                </g>
            </g>

            {/* Connection arrow between environments */}
            <g transform="translate(695, 400)">
                <path d="M0,0 L50,0" stroke="#535260" strokeWidth="2" strokeDasharray="4 4" />
                <polygon points="50,0 42,-4 42,4" fill="#535260" />
            </g>
        </svg>
    </div>
);

// Tab content component
const TabContent = ({ tabId }: { tabId: TabId }) => {
    switch (tabId) {
        case 'deploy':
            return <DeployContent />;
        case 'network':
            return <NetworkContent />;
        case 'scale':
            return <ScaleContent />;
        case 'monitor':
            return <MonitorContent />;
        case 'evolve':
            return <EvolveContent />;
        default:
            return null;
    }
};

export function HeroWithTabs() {
    const [activeTab, setActiveTab] = useState<TabId>('deploy');
    const [progress, setProgress] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const TAB_DURATION = 8000; // 8 seconds per tab

    const advanceTab = useCallback(() => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
        setProgress(0);
    }, [activeTab]);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    advanceTab();
                    return 0;
                }
                return prev + (100 / (TAB_DURATION / 100));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isAutoPlaying, advanceTab]);

    const handleTabClick = (tabId: TabId) => {
        setActiveTab(tabId);
        setProgress(0);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero content */}
                <div className="text-left mb-12 md:mb-16">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-5 max-w-4xl">
                        <span className="text-foreground">
                            Shipping great products is hard. Scaling infrastructure is easy.
                        </span>
                    </h1>

                    <h2 className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
                        NextNepal simplifies your infrastructure stack from servers to observability with a single, scalable, easy-to-use platform.
                    </h2>

                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/new"
                            className="inline-flex px-6 py-3 text-lg font-medium text-white rounded-lg bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                        >
                            Deploy a new project
                        </Link>
                        <Link
                            href="/book-demo"
                            className="hidden md:inline-flex px-6 py-3 text-lg font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            Book a demo
                        </Link>
                    </div>
                </div>

                {/* Tabbed section */}
                <div className="mt-16 md:mt-24">
                    {/* Tab buttons */}
                    <div className="w-full grid grid-cols-5 gap-1 mb-6 md:mb-8 overflow-x-auto">
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
                        >
                            <TabContent tabId={activeTab} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
