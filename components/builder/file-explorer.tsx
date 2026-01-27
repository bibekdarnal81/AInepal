"use client";

import React from 'react';
import {
    Folder,
    FileCode,
    FileJson,
    File,
    ChevronRight,
    ChevronDown,
    Settings,
    MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FileNode = {
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    isOpen?: boolean;
};

// Mock Initial Data
const initialFiles: FileNode[] = [
    {
        name: 'app',
        type: 'folder',
        isOpen: true,
        children: [
            { name: 'layout.tsx', type: 'file' },
            { name: 'page.tsx', type: 'file' },
            { name: 'globals.css', type: 'file' },
        ]
    },
    {
        name: 'components',
        type: 'folder',
        isOpen: false,
        children: [
            { name: 'button.tsx', type: 'file' },
            { name: 'card.tsx', type: 'file' },
        ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'next.config.js', type: 'file' },
];

export function FileExplorer() {
    // Simple recursive renderer
    const renderTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map((node, i) => (
            <div key={node.name + i}>
                <div
                    className={cn(
                        "flex items-center gap-1.5 py-1 px-2 hover:bg-white/5 cursor-pointer text-sm text-gray-400 hover:text-gray-200 select-none",
                        depth > 0 && "pl-" + (depth * 4 + 2) // Simple padding simulation, ideally use style
                    )}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    {node.type === 'folder' && (
                        node.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    )}
                    {node.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-blue-400" />
                    ) : (
                        node.name.endsWith('json') ? <FileJson className="w-4 h-4 text-yellow-400" /> :
                            node.name.endsWith('css') ? <FileCode className="w-4 h-4 text-cyan-400" /> :
                                <FileCode className="w-4 h-4 text-blue-400" />
                    )}
                    <span>{node.name}</span>
                </div>
                {node.type === 'folder' && node.isOpen && node.children && (
                    <div>{renderTree(node.children, depth + 1)}</div>
                )}
            </div>
        ));
    };

    return (
        <div className="h-full bg-black/50 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-white/5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Explorer</span>
                <button className="text-gray-500 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
                {renderTree(initialFiles)}
            </div>
        </div>
    );
}
