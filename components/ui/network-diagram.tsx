'use client';

import * as React from "react";

const NetworkDiagramSVG = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 640 660"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        {...props}
    >
        <g id="network-and-connect-v2" clipPath="url(#clip0_1918_62411)">
            <g id="background">
                <defs>
                    <pattern
                        id="dotPattern"
                        width={18}
                        height={18}
                        patternUnits="userSpaceOnUse"
                    >
                        <circle cx={0} cy={0} r={0.75} fill="white" fillOpacity={0.2} />
                    </pattern>
                </defs>
                <rect x={12} y={125} width={612} height={524} fill="url(#dotPattern)" />
            </g>

            {/* TCP Connection Line - Ackee to Postgres via Chat Node */}
            <path
                id="tcp-line-01"
                d="M121 381V440.5C121 444.918 124.582 448.5 129 448.5H271C275.418 448.5 279 452.082 279 456.5V516"
                stroke="#367578"
                strokeOpacity={0.75}
                strokeDasharray="4 4"
            />

            {/* Private Network Line - Frontend to API Gateway to Backend to Postgres */}
            <path
                id="pv-line-03"
                d="M332 217V275.5C332 279.918 335.582 283.5 340 283.5H423.5H524C528.418 283.5 532 287.082 532 291.5V380V570C532 574.418 528.418 578 524 578H386.5"
                stroke="#306EE8"
                strokeOpacity={0.75}
                strokeDasharray="4 4"
            />

            {/* Private Network Line - Frontend to Shield to API Gateway */}
            <path
                id="pv-line-02"
                d="M423.5 433.5H324C321.791 433.5 320 431.709 320 429.5V217"
                stroke="#306EE8"
                strokeOpacity={0.75}
                strokeDasharray="4 4"
            />

            {/* Private Network Line - Shield to Ackee */}
            <path
                id="pv-line-01"
                d="M308 217V325.5C308 329.918 304.418 333.5 300 333.5H216.5"
                stroke="#306EE8"
                strokeOpacity={0.75}
                strokeDasharray="4 4"
            />

            {/* HTTP Arrows - Top Right Node */}
            <g id="http-arrows-03" opacity={1}>
                <path
                    id="http-arrows--03-long"
                    opacity={0.5}
                    d="M528 98L532 102L536 98M528 110L532 114L536 110M528 122L532 126L536 122M528 134L532 138L536 134M528 146L532 150L536 146M528 158L532 162L536 158M528 170L532 174L536 170M528 182L532 186L536 182M528 194L532 198L536 194M528 206L532 210L536 206M528 218L532 222L536 218M528 230L532 234L536 230"
                    stroke="url(#paint0_linear_1918_62411)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    id="http-arrows--03-short"
                    d="M528 98L532 102L536 98M528 110L532 114L536 110M528 122L532 126L536 122"
                    stroke="url(#paint1_linear_1918_62411)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* HTTP Arrows - Top Center Node */}
            <g id="http-arrows-02" opacity={1}>
                <path
                    id="http-arrows--02-short"
                    d="M316 68L320 72L324 68M316 80L320 84L324 80M316 92L320 96L324 92"
                    stroke="url(#paint2_linear_1918_62411)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* HTTP Arrows - Top Left Node */}
            <g id="http-arrows-01" opacity={1}>
                <path
                    id="http-arrows--01-long"
                    opacity={0.5}
                    d="M104 112L108 116L112 112M104 124L108 128L112 124M104 136L108 140L112 136M104 148L108 152L112 148M104 160L108 164L112 160M104 172L108 176L112 172M104 184L108 188L112 184M104 196L108 200L112 196M104 208L108 212L112 208M104 220L108 224L112 220M104 232L108 236L112 232M104 244L108 248L112 244M104 256L108 260L112 256"
                    stroke="url(#paint3_linear_1918_62411)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    id="http-arrows--01-short"
                    d="M104 100L108 104L112 100M104 112L108 116L112 112M104 124L108 128L112 124"
                    stroke="url(#paint4_linear_1918_62411)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* Globe Badge - Top Right */}
            <g id="badge--http-03" opacity={0.5}>
                <path
                    d="M508 64C508 50.7452 518.745 40 532 40V40C545.255 40 556 50.7452 556 64V64C556 77.2548 545.255 88 532 88V88C518.745 88 508 77.2548 508 64V64Z"
                    fill="#853BCE"
                    fillOpacity={0.15}
                />
                <path
                    d="M532 87.25C519.159 87.25 508.75 76.8406 508.75 64C508.75 51.1594 519.159 40.75 532 40.75C544.841 40.75 555.25 51.1594 555.25 64C555.25 76.8406 544.841 87.25 532 87.25Z"
                    stroke="#853BCE"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                />
                <path
                    d="M543.667 63.9999C543.667 70.4432 538.443 75.6666 532 75.6666M543.667 63.9999C543.667 57.5566 538.443 52.3333 532 52.3333M543.667 63.9999H520.333M532 75.6666C525.557 75.6666 520.333 70.4432 520.333 63.9999M532 75.6666C534.918 72.4718 536.577 68.3259 536.667 63.9999C536.577 59.674 534.918 55.528 532 52.3333M532 75.6666C529.082 72.4718 527.423 68.3259 527.333 63.9999C527.423 59.674 529.082 55.528 532 52.3333M520.333 63.9999C520.333 57.5566 525.557 52.3333 532 52.3333"
                    stroke="#853BCE"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* Globe Badge - Top Center */}
            <g id="badge--http-02" opacity={0.5}>
                <path
                    d="M296 32C296 18.7452 306.745 8 320 8V8C333.255 8 344 18.7452 344 32V32C344 45.2548 333.255 56 320 56V56C306.745 56 296 45.2548 296 32V32Z"
                    fill="#853BCE"
                    fillOpacity={0.15}
                />
                <path
                    d="M320 55.25C307.159 55.25 296.75 44.8406 296.75 32C296.75 19.1594 307.159 8.75 320 8.75C332.841 8.75 343.25 19.1594 343.25 32C343.25 44.8406 332.841 55.25 320 55.25Z"
                    stroke="#853BCE"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                />
                <path
                    d="M331.667 31.9999C331.667 38.4432 326.443 43.6666 320 43.6666M331.667 31.9999C331.667 25.5566 326.443 20.3333 320 20.3333M331.667 31.9999H308.333M320 43.6666C313.557 43.6666 308.333 38.4432 308.333 31.9999M320 43.6666C322.918 40.4718 324.577 36.3259 324.667 31.9999C324.577 27.674 322.918 23.528 320 20.3333M320 43.6666C317.082 40.4718 315.423 36.3259 315.333 31.9999C315.423 27.674 317.082 23.528 320 20.3333M308.333 31.9999C308.333 25.5566 313.557 20.3333 320 20.3333"
                    stroke="#853BCE"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* Globe Badge - Top Left */}
            <g id="badge--http-01" opacity={0.5}>
                <path
                    d="M84 64C84 50.7452 94.7452 40 108 40V40C121.255 40 132 50.7452 132 64V64C132 77.2548 121.255 88 108 88V88C94.7452 88 84 77.2548 84 64V64Z"
                    fill="#853BCE"
                    fillOpacity={0.15}
                />
                <path
                    d="M108 87.25C95.1594 87.25 84.75 76.8406 84.75 64C84.75 51.1594 95.1594 40.75 108 40.75C120.841 40.75 131.25 51.1594 131.25 64C131.25 76.8406 120.841 87.25 108 87.25Z"
                    stroke="#853BCE"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                />
                <path
                    d="M119.667 63.9999C119.667 70.4432 114.443 75.6666 108 75.6666M119.667 63.9999C119.667 57.5566 114.443 52.3333 108 52.3333M119.667 63.9999H96.3334M108 75.6666C101.557 75.6666 96.3334 70.4432 96.3334 63.9999M108 75.6666C110.918 72.4718 112.577 68.3259 112.667 63.9999C112.577 59.674 110.918 55.528 108 52.3333M108 75.6666C105.082 72.4718 103.423 68.3259 103.333 63.9999C103.423 59.674 105.082 55.528 108 52.3333M96.3334 63.9999C96.3334 57.5566 101.557 52.3333 108 52.3333"
                    stroke="#853BCE"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* TCP Badge - Chat/Message Node */}
            <g id="badge--tcp" opacity={1}>
                <rect x={176} y={425} width={48} height={48} rx={24} fill="#101E20" />
                <rect
                    x={176.75}
                    y={425.75}
                    width={46.5}
                    height={46.5}
                    rx={23.25}
                    stroke="#429194"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                />
                <path
                    d="M194 445V446M198 445V446M202 445V446M206 445V446M203 457L206 454H208C208.53 454 209.039 453.789 209.414 453.414C209.789 453.039 210 452.53 210 452V443C210 442.47 209.789 441.961 209.414 441.586C209.039 441.211 208.53 441 208 441H192C191.47 441 190.961 441.211 190.586 441.586C190.211 441.961 190 442.47 190 443V452C190 452.53 190.211 453.039 190.586 453.414C190.961 453.789 191.47 454 192 454H194L197 457H203Z"
                    stroke="#56B0B3"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* Shield Badge - Private Network */}
            <g id="badge--private" opacity={1}>
                <rect x={296} y={260} width={48} height={48} rx={24} fill="#121929" />
                <rect
                    x={296.75}
                    y={260.75}
                    width={46.5}
                    height={46.5}
                    rx={23.25}
                    stroke="#2057C5"
                    strokeOpacity={0.6}
                    strokeWidth={1.5}
                />
                <path
                    d="M316.5 284L318.833 286.333L323.5 281.667M329.333 285.167C329.333 291 325.25 293.917 320.397 295.608C320.142 295.694 319.866 295.69 319.615 295.597C314.75 293.917 310.667 291 310.667 285.167V277C310.667 276.691 310.79 276.394 311.008 276.175C311.227 275.956 311.524 275.833 311.833 275.833C314.167 275.833 317.083 274.433 319.113 272.66C319.36 272.449 319.675 272.333 320 272.333C320.325 272.333 320.639 272.449 320.887 272.66C322.928 274.445 325.833 275.833 328.167 275.833C328.476 275.833 328.773 275.956 328.992 276.175C329.21 276.394 329.333 276.691 329.333 277V285.167Z"
                    stroke="#5E8EED"
                    strokeWidth={1.5}
                />
            </g>

            {/* Postgres Service Card */}
            <g id="05-service--postgres" opacity={1}>
                {/* Disk Attachment */}
                <path
                    d="M170 606H386V651C386 655.971 381.971 660 377 660H179C174.029 660 170 655.971 170 651V606Z"
                    fill="#0D0C13"
                />
                <path
                    d="M170.5 606.5H385.5V651C385.5 655.694 381.694 659.5 377 659.5H179C174.306 659.5 170.5 655.694 170.5 651V606.5Z"
                    stroke="white"
                    strokeOpacity={0.08}
                />
                <path d="M170 606H180.5V660H170V606Z" fill="white" fillOpacity={0.04} />

                {/* Disk Icon */}
                <path
                    d="M202 642H192M202 642V645C202 645.265 201.895 645.52 201.707 645.707C201.52 645.895 201.265 646 201 646H193C192.735 646 192.48 645.895 192.293 645.707C192.105 645.52 192 645.265 192 645V642M202 642L200.275 638.555C200.192 638.388 200.065 638.248 199.906 638.15C199.748 638.052 199.566 638 199.38 638H194.62C194.434 638 194.252 638.052 194.094 638.15C193.935 638.248 193.808 638.388 193.725 638.555L192 642M194 644H194.005M196 644H196.005"
                    stroke="#535260"
                    strokeWidth={1.125}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={215} y={645.818}>pg-data</tspan>
                </text>

                {/* Main Card */}
                <path
                    d="M170 525C170 520.029 174.029 516 179 516H377C381.971 516 386 520.029 386 525V615C386 619.971 381.971 624 377 624H179C174.029 624 170 619.971 170 615V525Z"
                    fill="#121018"
                />
                <path
                    d="M179 516.375H377C381.763 516.375 385.625 520.237 385.625 525V615C385.625 619.763 381.763 623.625 377 623.625H179C174.237 623.625 170.375 619.763 170.375 615V525C170.375 520.237 174.237 516.375 179 516.375Z"
                    stroke="white"
                    strokeOpacity={0.075}
                    strokeWidth={0.75}
                />

                {/* Postgres Icon */}
                <rect x={188} y={534} width={18} height={18} rx={4} fill="#336791" />
                <text fill="#F7F7F8" fontFamily="Inter, sans-serif" fontSize={12} fontWeight={600}>
                    <tspan x={215} y={547.364}>postgres</tspan>
                </text>

                {/* Check Icon + Status */}
                <circle cx={197} cy={596} r={5} stroke="#42946E" strokeWidth={1.2} fill="none" />
                <path d="M195 596L196.5 597.5L199 594.5" stroke="#42946E" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={215} y={600.068}>Just deployed</tspan>
                </text>
            </g>

            {/* Backend Service Card */}
            <g id="04-service--backend" opacity={1}>
                <path
                    d="M424 389C424 384.029 428.029 380 433 380H631C635.971 380 640 384.029 640 389V479C640 483.971 635.971 488 631 488H433C428.029 488 424 483.971 424 479V389Z"
                    fill="#121018"
                />
                <path
                    d="M433 380.375H631C635.763 380.375 639.625 384.237 639.625 389V479C639.625 483.763 635.763 487.625 631 487.625H433C428.237 487.625 424.375 483.763 424.375 479V389C424.375 384.237 428.237 380.375 433 380.375Z"
                    stroke="white"
                    strokeOpacity={0.075}
                    strokeWidth={0.75}
                />

                {/* Python Icon */}
                <rect x={442} y={398} width={18} height={18} rx={4} fill="#3776AB" />
                <text fill="#F7F7F8" fontFamily="Inter, sans-serif" fontSize={12} fontWeight={600}>
                    <tspan x={469} y={411.364}>backend</tspan>
                </text>

                {/* Check Icon + Status */}
                <circle cx={451} cy={460} r={5} stroke="#42946E" strokeWidth={1.2} fill="none" />
                <path d="M449 460L450.5 461.5L453 458.5" stroke="#42946E" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={469} y={464.068}>Just deployed</tspan>
                </text>
            </g>

            {/* Ackee Analytics Service Card */}
            <g id="03-service--ackee" opacity={1}>
                <path
                    d="M0 278C0 273.029 4.02944 269 9 269H207C211.971 269 216 273.029 216 278V368C216 372.971 211.971 377 207 377H9C4.02944 377 0 372.971 0 368V278Z"
                    fill="#121018"
                />
                <path
                    d="M9 269.375H207C211.763 269.375 215.625 273.237 215.625 278V368C215.625 372.763 211.763 376.625 207 376.625H9C4.23654 376.625 0.375 372.763 0.375 368V278C0.375 273.237 4.23654 269.375 9 269.375Z"
                    stroke="white"
                    strokeOpacity={0.075}
                    strokeWidth={0.75}
                />

                {/* Ackee Icon (Gradient Circle) */}
                <circle cx={27} cy={296} r={9} fill="url(#paint7_linear_1918_62411)" />
                <text fill="#F7F7F8" fontFamily="Inter, sans-serif" fontSize={12} fontWeight={600}>
                    <tspan x={45} y={300.364}>ackee analytics</tspan>
                </text>
                <text fill="#BF92EC" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={45} y={319.318}>ackee-prod.up. Rusha.app</tspan>
                </text>

                {/* Check Icon + Status */}
                <circle cx={26} cy={349} r={5} stroke="#42946E" strokeWidth={1.2} fill="none" />
                <path d="M24 349L25.5 350.5L28 347.5" stroke="#42946E" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={45} y={353.068}>Just deployed</tspan>
                </text>
            </g>

            {/* API Gateway Service Card */}
            <g id="02-service--api-gateway" opacity={1}>
                <path
                    d="M424 253C424 248.029 428.029 244 433 244H631C635.971 244 640 248.029 640 253V343C640 347.971 635.971 352 631 352H433C428.029 352 424 347.971 424 343V253Z"
                    fill="#121018"
                />
                <path
                    d="M433 244.375H631C635.763 244.375 639.625 248.237 639.625 253V343C639.625 347.763 635.763 351.625 631 351.625H433C428.237 351.625 424.375 347.763 424.375 343V253C424.375 248.237 428.237 244.375 433 244.375Z"
                    stroke="white"
                    strokeOpacity={0.075}
                    strokeWidth={0.75}
                />

                {/* Go Icon */}
                <rect x={442} y={262} width={18} height={18} rx={4} fill="#00ADD8" />
                <text fill="#fff" fontFamily="Inter, sans-serif" fontSize={8} fontWeight={700}>
                    <tspan x={446} y={274}>GO</tspan>
                </text>
                <text fill="#F7F7F8" fontFamily="Inter, sans-serif" fontSize={12} fontWeight={600}>
                    <tspan x={469} y={275.364}>api gateway</tspan>
                </text>
                <text fill="#BF92EC" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={469} y={294.318}>api-prod.up. Rusha.app</tspan>
                </text>

                {/* Check Icon + Status */}
                <circle cx={451} cy={324} r={5} stroke="#42946E" strokeWidth={1.2} fill="none" />
                <path d="M449 324L450.5 325.5L453 322.5" stroke="#42946E" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={469} y={328.068}>Just deployed</tspan>
                </text>
            </g>

            {/* Frontend Service Card */}
            <g id="01-service--frontend" opacity={1}>
                <path
                    d="M212 117C212 112.029 216.029 108 221 108H419C423.971 108 428 112.029 428 117V207C428 211.971 423.971 216 419 216H221C216.029 216 212 211.971 212 207V117Z"
                    fill="#121018"
                />
                <path
                    d="M221 108.375H419C423.763 108.375 427.625 112.237 427.625 117V207C427.625 211.763 423.763 215.625 419 215.625H221C216.237 215.625 212.375 211.763 212.375 207V117C212.375 112.237 216.237 108.375 221 108.375Z"
                    stroke="white"
                    strokeOpacity={0.075}
                    strokeWidth={0.75}
                />

                {/* JS Icon */}
                <rect x={230} y={126} width={18} height={18} rx={2} fill="#F0DB4F" />
                <text fill="#323330" fontFamily="Inter, sans-serif" fontSize={9} fontWeight={700}>
                    <tspan x={233} y={139}>JS</tspan>
                </text>
                <text fill="#F7F7F8" fontFamily="Inter, sans-serif" fontSize={12} fontWeight={600}>
                    <tspan x={257} y={139.364}>frontend</tspan>
                </text>
                <text fill="#BF92EC" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={257} y={158.318}>frontend-prod.up. Rusha.app</tspan>
                </text>

                {/* Check Icon + Status */}
                <circle cx={239} cy={188} r={5} stroke="#42946E" strokeWidth={1.2} fill="none" />
                <path d="M237 188L238.5 189.5L241 186.5" stroke="#42946E" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                <text fill="#868593" fontFamily="Inter, sans-serif" fontSize={10.5}>
                    <tspan x={257} y={192.068}>Just deployed</tspan>
                </text>
            </g>
        </g>

        <defs>
            <linearGradient id="paint0_linear_1918_62411" x1={532} y1={86} x2={532} y2={234} gradientUnits="userSpaceOnUse">
                <stop stopColor="#2F0A54" />
                <stop offset={1} stopColor="#853BCE" />
            </linearGradient>
            <linearGradient id="paint1_linear_1918_62411" x1={532} y1={65.5} x2={532} y2={139.5} gradientUnits="userSpaceOnUse">
                <stop stopColor="#2F0A54" />
                <stop offset={1} stopColor="#853BCE" />
            </linearGradient>
            <linearGradient id="paint2_linear_1918_62411" x1={320} y1={35.5} x2={320} y2={109.5} gradientUnits="userSpaceOnUse">
                <stop stopColor="#2F0A54" />
                <stop offset={1} stopColor="#853BCE" />
            </linearGradient>
            <linearGradient id="paint3_linear_1918_62411" x1={108} y1={112} x2={108} y2={260} gradientUnits="userSpaceOnUse">
                <stop stopColor="#2F0A54" />
                <stop offset={1} stopColor="#853BCE" />
            </linearGradient>
            <linearGradient id="paint4_linear_1918_62411" x1={108} y1={67.5} x2={108} y2={141.5} gradientUnits="userSpaceOnUse">
                <stop stopColor="#2F0A54" />
                <stop offset={1} stopColor="#853BCE" />
            </linearGradient>
            <linearGradient id="paint7_linear_1918_62411" x1={18} y1={287} x2={36} y2={305} gradientUnits="userSpaceOnUse">
                <stop stopColor="#73FAC8" />
                <stop offset={1} stopColor="#00BEE1" />
            </linearGradient>
            <clipPath id="clip0_1918_62411">
                <rect width={640} height={660} fill="white" />
            </clipPath>
        </defs>
    </svg>
);

export default NetworkDiagramSVG;
