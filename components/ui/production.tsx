'use client';

import * as React from "react";

// Optimized version - loads SVG from public directory instead of embedding it
// This reduces the JavaScript bundle size from 808KB to just a few bytes
// The SVG is now a static asset that can be cached separately
const ProductionDiagramSVG = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <div className="w-full max-w-container mx-auto">
            <object
                type="image/svg+xml"
                data="/production-diagram.svg"
                className="w-full h-auto"
                aria-label="Production and Development Environment Diagram"
                {...(props as any)}
            >
                {/* Fallback for browsers that don't support object tag */}
                <img
                    src="/production-diagram.svg"
                    alt="Production and Development Environment Diagram showing Railway deployment workflow"
                    className="w-full h-auto"
                />
            </object>
        </div>
    );
};

export { ProductionDiagramSVG };
