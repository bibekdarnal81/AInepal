'use client';

import * as React from "react";

const EvolveDiagramSVG = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        {...props}
    >
        <g id="evolve-illustration">
            {/* Production Lane */}
            <g id="lane--production">
                <g id="bg-production-lane">
                    <rect
                        width={708}
                        height={580}
                        rx={12}
                        fill="url(#paint0_radial)"
                        fillOpacity={0.04}
                    />
                    <rect
                        width={708}
                        height={580}
                        rx={12}
                        fill="url(#paint1_linear)"
                        fillOpacity={0.15}
                    />
                    <rect
                        x={0.5}
                        y={0.5}
                        width={707}
                        height={579}
                        rx={11.5}
                        stroke="url(#paint2_linear)"
                        strokeOpacity={0.3}
                    />
                </g>
                <g id="branch-name--production">
                    <rect
                        x={48}
                        y={48}
                        width={40}
                        height={40}
                        rx={7}
                        fill="#15231D"
                    />
                    <path
                        d="M63 60.5V70.5M63 70.5C61.62 70.5 60.5 71.62 60.5 73C60.5 74.38 61.62 75.5 63 75.5C64.38 75.5 65.5 74.38 65.5 73M63 70.5C64.38 70.5 65.5 71.62 65.5 73M73 65.5C74.38 65.5 75.5 64.38 75.5 63C75.5 61.62 74.38 60.5 73 60.5C71.62 60.5 70.5 61.62 70.5 63C70.5 64.38 71.62 65.5 73 65.5ZM73 65.5C73 67.49 72.21 69.4 70.8 70.8C69.4 72.21 67.49 73 65.5 73"
                        stroke="#72C09C"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <text
                        fill="#B9DFCD"
                        fontFamily="var(--font-jetbrains-mono), monospace"
                        fontSize={20}
                        letterSpacing="0em"
                    >
                        <tspan x={108} y={75}>
                            {"production"}
                        </tspan>
                    </text>
                </g>
            </g>

            {/* Development Lane */}
            <g id="lane--development">
                <g id="bg-development-lane">
                    <rect
                        x={732}
                        width={708}
                        height={580}
                        rx={12}
                        fill="url(#paint4_radial)"
                        fillOpacity={0.05}
                    />
                    <rect
                        x={732}
                        width={708}
                        height={580}
                        rx={12}
                        fill="url(#paint5_linear)"
                        fillOpacity={0.2}
                    />
                    <rect
                        x={732.5}
                        y={0.5}
                        width={707}
                        height={579}
                        rx={11.5}
                        stroke="url(#paint6_linear)"
                        strokeOpacity={0.4}
                    />
                </g>
                <g id="branch-name--development">
                    <rect
                        x={780}
                        y={48}
                        width={40}
                        height={40}
                        rx={7}
                        fill="#0F1B33"
                    />
                    <path
                        d="M795 60.5V70.5M795 70.5C793.62 70.5 792.5 71.62 792.5 73C792.5 74.38 793.62 75.5 795 75.5C796.38 75.5 797.5 74.38 797.5 73M795 70.5C796.38 70.5 797.5 71.62 797.5 73M805 65.5C806.38 65.5 807.5 64.38 807.5 63C807.5 61.62 806.38 60.5 805 60.5C803.62 60.5 802.5 61.62 802.5 63C802.5 64.38 803.62 65.5 805 65.5ZM805 65.5C805 67.49 804.21 69.4 802.8 70.8C801.4 72.21 799.49 73 797.5 73"
                        stroke="#5E8EED"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <text
                        fill="#BACEF7"
                        fontFamily="var(--font-jetbrains-mono), monospace"
                        fontSize={20}
                        letterSpacing="0em"
                    >
                        <tspan x={840} y={75}>
                            {"development"}
                        </tspan>
                    </text>
                </g>
            </g>

            {/* Production Canvas */}
            <g id="frame-production">
                <rect
                    x={48}
                    y={128}
                    width={612}
                    height={320}
                    rx={8}
                    fill="hsla(0, 0%, 3%, 1)"
                    stroke="#1C362A"
                    strokeOpacity={0.5}
                />

                {/* Header */}
                <g id="header-production">
                    <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={500}>
                        <tspan x={80} y={145}>gravy-truck</tspan>
                    </text>
                    <text fill="#535260" fontFamily="var(--font-inter)" fontSize={7}>
                        <tspan x={140} y={145}>/</tspan>
                    </text>
                    <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={500}>
                        <tspan x={150} y={145}>production</tspan>
                    </text>
                    <rect x={48} y={155} width={612} height={1} fill="white" fillOpacity={0.08} />
                </g>

                {/* Service Cards - Production */}
                <g id="services-production">
                    {/* Frontend Card */}
                    <g id="service-frontend">
                        <rect x={147} y={190} width={122} height={61} rx={4} fill="#181622" />
                        <rect x={147.2} y={190.2} width={121.6} height={60.6} rx={3.8} stroke="white" strokeOpacity={0.08} strokeWidth={0.4} />
                        <circle cx={162} cy={205} r={5} fill="white" fillOpacity={0.9} />
                        <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={600}>
                            <tspan x={172} y={208}>frontend</tspan>
                        </text>
                        <text fill="#BF92EC" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={172} y={220}>frontend-prod.up.rusha.app</tspan>
                        </text>
                        <circle cx={162} cy={235} r={4} stroke="#42946E" strokeWidth={0.7} fill="none" />
                        <path d="M160 235l1.5 1.5 3-3" stroke="#42946E" strokeWidth={0.7} strokeLinecap="round" />
                        <text fill="#868593" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={172} y={238}>Just now via GitHub</tspan>
                        </text>
                    </g>

                    {/* API Card */}
                    <g id="service-api">
                        <rect x={293} y={190} width={122} height={61} rx={4} fill="#181622" />
                        <rect x={293.2} y={190.2} width={121.6} height={60.6} rx={3.8} stroke="white" strokeOpacity={0.08} strokeWidth={0.4} />
                        <circle cx={308} cy={205} r={5} fill="#4AA4CC" fillOpacity={0.9} />
                        <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={600}>
                            <tspan x={318} y={208}>api</tspan>
                        </text>
                        <text fill="#BF92EC" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={318} y={220}>api-prod.up.rusha.app</tspan>
                        </text>
                        <circle cx={308} cy={235} r={4} stroke="#42946E" strokeWidth={0.7} fill="none" />
                        <path d="M306 235l1.5 1.5 3-3" stroke="#42946E" strokeWidth={0.7} strokeLinecap="round" />
                        <text fill="#868593" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={318} y={238}>Just now via GitHub</tspan>
                        </text>
                    </g>

                    {/* Postgres Card */}
                    <g id="service-postgres">
                        <rect x={439} y={190} width={122} height={61} rx={4} fill="#181622" />
                        <rect x={439.2} y={190.2} width={121.6} height={60.6} rx={3.8} stroke="#33323E" strokeWidth={0.4} />
                        <circle cx={454} cy={205} r={5} fill="#336791" />
                        <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={600}>
                            <tspan x={464} y={208}>postgres</tspan>
                        </text>
                        <circle cx={454} cy={235} r={4} stroke="#42946E" strokeWidth={0.7} fill="none" />
                        <path d="M452 235l1.5 1.5 3-3" stroke="#42946E" strokeWidth={0.7} strokeLinecap="round" />
                        <text fill="#868593" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={464} y={238}>Just deployed via Docker...</tspan>
                        </text>
                        {/* Disk attachment */}
                        <rect x={439} y={251} width={122} height={26} rx={4} fill="#13111C" />
                        <rect x={439.2} y={251.2} width={121.6} height={25.6} rx={3.8} stroke="#33323E" strokeWidth={0.4} />
                        <text fill="#868593" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={464} y={268}>pg-disk</tspan>
                        </text>
                    </g>

                    {/* Umami Card */}
                    <g id="service-umami">
                        <rect x={147} y={290} width={122} height={61} rx={4} fill="#181622" />
                        <rect x={147.2} y={290.2} width={121.6} height={60.6} rx={3.8} stroke="white" strokeOpacity={0.08} strokeWidth={0.4} />
                        <circle cx={162} cy={305} r={5} fill="white" />
                        <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={600}>
                            <tspan x={172} y={308}>umami</tspan>
                        </text>
                        <text fill="#BF92EC" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={172} y={320}>umami-prod.up.rusha.app</tspan>
                        </text>
                        <circle cx={162} cy={335} r={4} stroke="#42946E" strokeWidth={0.7} fill="none" />
                        <path d="M160 335l1.5 1.5 3-3" stroke="#42946E" strokeWidth={0.7} strokeLinecap="round" />
                        <text fill="#868593" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={172} y={338}>Just now via GitHub</tspan>
                        </text>
                    </g>

                    {/* Worker Cards */}
                    <g id="service-workers">
                        <rect x={293} y={290} width={122} height={61} rx={4} fill="#181622" />
                        <rect x={293.2} y={290.2} width={121.6} height={60.6} rx={3.8} stroke="white" strokeOpacity={0.08} strokeWidth={0.4} />
                        <circle cx={308} cy={305} r={5} fill="#689F63" />
                        <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={600}>
                            <tspan x={318} y={308}>worker 1</tspan>
                        </text>
                        <circle cx={308} cy={335} r={4} stroke="#42946E" strokeWidth={0.7} fill="none" />
                        <path d="M306 335l1.5 1.5 3-3" stroke="#42946E" strokeWidth={0.7} strokeLinecap="round" />
                        <text fill="#868593" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={318} y={338}>Just now via GitHub</tspan>
                        </text>

                        {/* Worker 2 overlapped */}
                        <rect x={293} y={320} width={122} height={61} rx={4} fill="#181622" />
                        <rect x={293.2} y={320.2} width={121.6} height={60.6} rx={3.8} stroke="white" strokeOpacity={0.08} strokeWidth={0.4} />
                        <circle cx={308} cy={335} r={5} fill="#689F63" />
                        <text fill="#F7F7F8" fontFamily="var(--font-inter)" fontSize={7} fontWeight={600}>
                            <tspan x={318} y={338}>worker 2</tspan>
                        </text>
                        <circle cx={308} cy={365} r={4} stroke="#42946E" strokeWidth={0.7} fill="none" />
                        <path d="M306 365l1.5 1.5 3-3" stroke="#42946E" strokeWidth={0.7} strokeLinecap="round" />
                        <text fill="#868593" fontFamily="var(--font-inter)" fontSize={6}>
                            <tspan x={318} y={368}>Just now via GitHub</tspan>
                        </text>
                    </g>

                    {/* Connection lines */}
                    <path d="M269 220H293" stroke="white" strokeOpacity={0.15} strokeDasharray="2 2" />
                    <path d="M415 220H439" stroke="white" strokeOpacity={0.15} strokeDasharray="2 2" />
                    <path d="M354 251V290" stroke="white" strokeOpacity={0.15} strokeDasharray="2 2" />
                    <path d="M208 251V290" stroke="white" strokeOpacity={0.15} strokeDasharray="2 2" />
                    <path d="M208 275H354" stroke="white" strokeOpacity={0.15} strokeDasharray="2 2" />
                </g>

                {/* Green overlay */}
                <rect
                    x={48}
                    y={128}
                    width={612}
                    height={320}
                    rx={8}
                    fill="#42946E"
                    fillOpacity={0.15}
                    style={{ mixBlendMode: "color" }}
                />
            </g>

            {/* Avatar Production */}
            <circle cx={660} cy={108} r={22} fill="url(#avatar1)" />
            <circle cx={660} cy={108} r={24} stroke="#050909" strokeWidth={4} fill="none" />
        </g>

        {/* Gradients */}
        <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(354 290) scale(400)">
                <stop stopColor="#42946E" />
                <stop offset="1" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="paint1_linear" x1="354" y1="0" x2="354" y2="580">
                <stop stopColor="#42946E" stopOpacity="0.3" />
                <stop offset="1" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="paint2_linear" x1="354" y1="0" x2="354" y2="580">
                <stop stopColor="#42946E" />
                <stop offset="1" stopColor="transparent" />
            </linearGradient>
            <radialGradient id="paint4_radial" cx="0" cy="0" r="1" gradientTransform="translate(1086 290) scale(400)">
                <stop stopColor="#5E8EED" />
                <stop offset="1" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="paint5_linear" x1="1086" y1="0" x2="1086" y2="580">
                <stop stopColor="#5E8EED" stopOpacity="0.3" />
                <stop offset="1" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="paint6_linear" x1="1086" y1="0" x2="1086" y2="580">
                <stop stopColor="#5E8EED" />
                <stop offset="1" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="avatar1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
        </defs>
    </svg>
);

export { EvolveDiagramSVG };
