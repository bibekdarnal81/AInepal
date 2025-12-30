'use client';

import * as React from "react";

const ScaleDiagramSVG = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 1442 1026"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto rounded-lg"
        {...props}
    >
        <g clipPath="url(#a)">
            <rect x={1} y={1} width={1440} height={1024} rx={8} fill="#0d0c14" />
            <path fill="#fff" fillOpacity={0.075} d="M1 61h1440v1H1z" />
            <defs>
                <pattern id="b" width={24} height={24} patternUnits="userSpaceOnUse">
                    <circle cx={1} cy={1} r={1} fill="#fff" fillOpacity={0.09} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#b)" clipPath="url(#c)" />

            {/* Left sidebar icons */}
            <rect x={25.5} y={87.5} width={33} height={33} rx={5.5} stroke="#33323e" />
            <path
                d="M42 100a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333m4.667 0a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333m-9.334 0a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333M42 104.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334m4.667 0a.667.667 0 1 0-.001-1.334.667.667 0 0 0 0 1.334m-9.333 0a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334M42 109.333a.666.666 0 1 0 0-1.332.666.666 0 0 0 0 1.332m4.667 0a.666.666 0 1 0 0-1.332.666.666 0 0 0 0 1.332m-9.334 0a.666.666 0 1 0 .001-1.332.666.666 0 0 0 0 1.332"
                stroke="#868593"
                strokeWidth={1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Plus button */}
            <mask id="d" fill="#fff">
                <path d="M25 139a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v28H25z" />
            </mask>
            <path
                d="M24 139a7 7 0 0 1 7-7h22a7 7 0 0 1 7 7h-2a5 5 0 0 0-5-5H31a5 5 0 0 0-5 5zm35 28H25zm-35 0v-28a7 7 0 0 1 7-7v2a5 5 0 0 0-5 5v28zm29-35a7 7 0 0 1 7 7v28h-2v-28a5 5 0 0 0-5-5z"
                fill="#33323e"
                mask="url(#d)"
            />
            <path
                d="M42 145.333v9.334M37.333 150h9.334"
                stroke="#a1a0ab"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Top right buttons */}
            <rect x={1231.5} y={86.5} width={82} height={33} rx={5.5} stroke="#33323e" />
            <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={14}>
                <tspan x={1268} y={108.091}>Sync</tspan>
            </text>

            <rect x={1322.5} y={86.5} width={94} height={33} rx={5.5} stroke="#33323e" />
            <path
                d="M1343 98.333v9.334m-4.67-4.667h9.34"
                stroke="#868593"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={14}>
                <tspan x={1359} y={108.091}>Create</tspan>
            </text>

            {/* Top navigation */}
            <mask id="i" fill="#fff">
                <path d="M951 1h83v60h-83z" />
            </mask>
            <path d="M1034 59h-83v4h83z" fill="#3d2259" mask="url(#i)" />
            <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={14} fontWeight={500}>
                <tspan x={951} y={36.091}>Architecture</tspan>
            </text>
            <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14} fontWeight={500}>
                <tspan x={1058} y={36.091}>Observability</tspan>
            </text>
            <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14} fontWeight={500}>
                <tspan x={1171} y={36.091}>Logs</tspan>
            </text>
            <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14} fontWeight={500}>
                <tspan x={1228} y={36.091}>Settings</tspan>
            </text>
            <rect x={1308} y={19} width={2} height={24} rx={1} fill="#fff" fillOpacity={0.075} />
            <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14} fontWeight={500}>
                <tspan x={1334} y={36.091}>Share</tspan>
            </text>

            {/* Avatar */}
            <circle cx={1405} cy={31} r={12} fill="url(#avatarGradient)" />

            {/* Breadcrumb */}
            <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={14}>
                <tspan x={77} y={36.091}>project_name</tspan>
            </text>
            <path d="M181.34 21.493a.714.714 0 0 1 1.357.44l-6.037 18.574a.714.714 0 0 1-1.357-.44z" fill="#535260" />
            <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={14} fontWeight={500}>
                <tspan x={191} y={36.091}>production</tspan>
            </text>
            <path d="m272 29 4 4 4-4" stroke="#c4c4ca" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Postgres Service Group */}
            <g opacity={1}>
                <rect x={240.667} y={567.667} width={647.667} height={288.667} rx={10} fill="#102e96" fillOpacity={0.1} />
                <rect x={240.667} y={567.667} width={647.667} height={288.667} rx={10} stroke="#183367" strokeWidth={1.333} />

                {/* Postgres Card */}
                <rect x={576.333} y={638.667} width={288} height={144} rx={10} fill="#181622" />
                <rect x={576.833} y={639.167} width={287} height={143} rx={9.5} stroke="#fff" strokeOpacity={0.08} />

                {/* Postgres Icon */}
                <rect x={600} y={662} width={24} height={24} rx={4} fill="#336791" />
                <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={16} fontWeight={600}>
                    <tspan x={636.333} y={680.485}>postgres</tspan>
                </text>

                {/* Deploy status */}
                <circle cx={612} cy={746} r={6} stroke="#42946e" strokeWidth={1.5} fill="none" />
                <path d="M609.5 746l1.5 1.5 3-3" stroke="#42946e" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={636} y={751.091}>Deployed via Docker Image</tspan>
                </text>

                {/* Disk attachment */}
                <path d="M576.333 758.667h288v60c0 6.627-5.372 12-12 12h-264c-6.627 0-12-5.373-12-12z" fill="#13111c" />
                <path d="M576.833 759.167h287v59.5c0 6.351-5.148 11.5-11.5 11.5h-264c-6.351 0-11.5-5.149-11.5-11.5z" stroke="#fff" strokeOpacity={0.1} />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={636.333} y={811.757}>pg-data</tspan>
                </text>

                {/* Metabase Card */}
                <rect x={263.333} y={638.667} width={288} height={144} rx={10} fill="#181622" />
                <rect x={263.833} y={639.167} width={287} height={143} rx={9.5} stroke="#fff" strokeOpacity={0.08} />

                {/* Metabase Icon */}
                <g fill="#509ee3">
                    <circle cx={299.224} cy={668.803} r={1.45} />
                    <circle cx={303.25} cy={668.803} r={1.45} />
                    <circle cx={303.25} cy={664.127} r={1.45} />
                    <circle cx={303.25} cy={673.479} r={1.45} />
                    <circle cx={307.276} cy={668.803} r={1.45} />
                </g>
                <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={16} fontWeight={600}>
                    <tspan x={323.333} y={680.485}>Metabase</tspan>
                </text>
                <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={323.333} y={705.757}>mtbase-prod.up. Dunzo.app</tspan>
                </text>

                {/* Metabase deploy status */}
                <circle cx={299} cy={746} r={6} stroke="#42946e" strokeWidth={1.5} fill="none" />
                <path d="M296.5 746l1.5 1.5 3-3" stroke="#42946e" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={323} y={751.091}>Deployed via Docker Image</tspan>
                </text>

                {/* Folder icon and label */}
                <path
                    d="M278.444 607.444a1.556 1.556 0 0 1-1.555 1.556h-12.445a1.556 1.556 0 0 1-1.555-1.556v-10.888a1.556 1.556 0 0 1 1.555-1.556h3.889l1.556 2.333h7a1.556 1.556 0 0 1 1.555 1.556z"
                    stroke="#1d4596"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <text fill="#fff" fillOpacity={0.5} fontFamily="Inter, sans-serif" fontSize={13.333} fontWeight={600}>
                    <tspan x={288} y={606.848}>Metabase</tspan>
                </text>
            </g>

            {/* Redis Card */}
            <g>
                <rect x={960} y={350.333} width={288} height={144} rx={10} fill="#181622" />
                <rect x={960.5} y={350.833} width={287} height={143} rx={9.5} stroke="#fff" strokeOpacity={0.08} />

                {/* Redis Icon */}
                <g fill="#d82c20">
                    <path d="M1006.84 391.79c-1.26.656-7.765 3.318-9.153 4.05-1.387.731-2.156.712-3.243.187-1.088-.525-8.007-3.3-9.263-3.9-.619-.3-.937-.544-.937-.787v-2.382s9-1.968 10.462-2.475c1.463-.525 1.95-.543 3.188-.093 1.237.45 8.646 1.781 9.866 2.231v2.344c0 .243-.29.506-.92.825" />
                </g>
                <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={16} fontWeight={600}>
                    <tspan x={1020} y={392.151}>redis</tspan>
                </text>

                {/* Disk attachment for redis */}
                <path d="M960 470.333h288v60c0 6.628-5.37 12-12 12H972c-6.627 0-12-5.372-12-12z" fill="#13111c" />
                <path d="M960.5 470.833h287v59.5c0 6.352-5.15 11.5-11.5 11.5H972c-6.351 0-11.5-5.148-11.5-11.5z" stroke="#fff" strokeOpacity={0.1} />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={1020} y={523.424}>/bitnami</tspan>
                </text>

                {/* Redis deploy status */}
                <circle cx={996} cy={456} r={6} stroke="#42946e" strokeWidth={1.5} fill="none" />
                <path d="M993.5 456l1.5 1.5 3-3" stroke="#42946e" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={1020} y={462.091}>Deployed via Docker Image</tspan>
                </text>
            </g>

            {/* Frontend Card */}
            <g>
                <rect x={216} y={232} width={288} height={144} rx={10} fill="#181622" />
                <rect x={216.5} y={232.5} width={287} height={143} rx={9.5} stroke="#fff" strokeOpacity={0.08} />

                {/* Next.js Icon */}
                <circle cx={252} cy={268} r={12} fill="#000" stroke="#fff" strokeOpacity={0.2} />
                <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={16} fontWeight={600}>
                    <tspan x={276} y={273.818}>frontend</tspan>
                </text>
                <text fill="#bf92ec" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={276} y={297.758}>frontend-prod.up. Dunzo.app</tspan>
                </text>

                {/* Deploy status */}
                <circle cx={252} cy={339} r={6} stroke="#42946e" strokeWidth={1.5} fill="none" />
                <path d="M249.5 339l1.5 1.5 3-3" stroke="#42946e" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={276} y={344.091}>Deployed just now</tspan>
                </text>
            </g>

            {/* Backend Card */}
            <g>
                <rect x={576.333} y={232} width={288} height={144} rx={10} fill="#181622" />
                <rect x={576.833} y={232.5} width={287} height={143} rx={9.5} stroke="#fff" strokeOpacity={0.08} />

                {/* Django Icon */}
                <circle cx={612} cy={268} r={12} fill="#092E20" />
                <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={16} fontWeight={600}>
                    <tspan x={636.333} y={273.818}>backend</tspan>
                </text>

                {/* Deploy status */}
                <circle cx={612} cy={339} r={6} stroke="#42946e" strokeWidth={1.5} fill="none" />
                <path d="M609.5 339l1.5 1.5 3-3" stroke="#42946e" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={636} y={344.091}>Deployed just now</tspan>
                </text>

                {/* Replicas */}
                <path d="M576.333 352h288v60c0 6.627-5.372 12-12 12h-264c-6.627 0-12-5.373-12-12z" fill="#100e19" />
                <path d="M576.833 352.5h287V412c0 6.351-5.148 11.5-11.5 11.5h-264c-6.351 0-11.5-5.149-11.5-11.5z" stroke="#fff" strokeOpacity={0.1} />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={14}>
                    <tspan x={636.333} y={405.091}>3 Replicas</tspan>
                </text>
            </g>

            {/* Connection lines */}
            <path
                d="M576 302.667h-72"
                stroke="#33323e"
                strokeWidth={1.333}
                strokeDasharray="5.33 5.33"
            />
            <path
                d="M864.333 302.667H906.5a5.333 5.333 0 0 1 5.333 5.333v134.667a5.334 5.334 0 0 0 5.334 5.333h42.5"
                stroke="#33323e"
                strokeWidth={1.333}
                strokeDasharray="5.33 5.33"
            />
            <path
                d="M720.667 424v66.667a5.334 5.334 0 0 1-5.334 5.333H413.667a5.334 5.334 0 0 0-5.334 5.333V638"
                stroke="#33323e"
                strokeWidth={1.333}
                strokeDasharray="5.33 5.33"
            />

            {/* Activity panel */}
            <mask id="h" fill="#fff">
                <path d="M1097 985a8 8 0 0 1 8-8h304a8 8 0 0 1 8 8v40h-320z" />
            </mask>
            <path d="M1097 985a8 8 0 0 1 8-8h304a8 8 0 0 1 8 8v40h-320z" fill="#0d0c14" />
            <path
                d="M1096 985a9 9 0 0 1 9-9h304a9 9 0 0 1 9 9h-2c0-3.866-3.13-7-7-7h-304c-3.87 0-7 3.134-7 7zm321 40h-320zm-321 0v-40a9 9 0 0 1 9-9v2c-3.87 0-7 3.134-7 7v40zm313-49a9 9 0 0 1 9 9v40h-2v-40c0-3.866-3.13-7-7-7z"
                fill="#fff"
                fillOpacity={0.075}
                mask="url(#h)"
            />
            <text fill="#f7f7f8" fontFamily="Inter, sans-serif" fontSize={14}>
                <tspan x={1157} y={1006.09}>Activity</tspan>
            </text>
            <path d="m1389 1003-4-4-4 4" stroke="#868593" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <rect x={0.5} y={0.5} width={1441} height={1025} rx={8.5} stroke="#2b2a31" />

        <defs>
            <clipPath id="c">
                <rect x={1} y={72} width={1440} height={1024} rx={8} fill="#0d0c14" />
            </clipPath>
            <clipPath id="a">
                <rect x={1} y={1} width={1440} height={1024} rx={8} fill="#fff" />
            </clipPath>
            <linearGradient id="avatarGradient" x1={1393} y1={19} x2={1417} y2={43} gradientUnits="userSpaceOnUse">
                <stop stopColor="#7e28bc" />
                <stop offset={1} stopColor="#531aff" />
            </linearGradient>
        </defs>
    </svg>
);

export default ScaleDiagramSVG;
