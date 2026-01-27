"use client";

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const mockCode = `import React from 'react';

export default function HelloWorld() {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <p>Welcome to your generic app!</p>
    </div>
  );
}
`;

export function CodeEditor() {
    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            <div className="flex items-center gap-0 bg-[#1e1e1e] border-b border-white/5">
                <div className="px-4 py-2 text-sm text-yellow-400 border-t-2 border-yellow-400 bg-[#1e1e1e]">
                    page.tsx
                </div>
                <div className="px-4 py-2 text-sm text-gray-500 hover:bg-white/5 cursor-pointer">
                    globals.css
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative text-sm">
                <SyntaxHighlighter
                    language="tsx"
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, height: '100%', borderRadius: 0 }}
                    showLineNumbers={true}
                >
                    {mockCode}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
