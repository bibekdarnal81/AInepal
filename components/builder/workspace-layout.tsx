"use client";

import React, { useState } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { FileExplorer } from './file-explorer';
import { CodeEditor } from './code-editor';
import { ChatInterface } from './chat-interface';
import { PreviewPane } from './preview-pane';

export function WorkspaceLayout() {
    const [showTerminal, setShowTerminal] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'chat'>('chat');

    return (
        <div className="h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-black text-white">
            <PanelGroup orientation="horizontal">
                {/* Sidebar */}
                <Panel defaultSize={20} minSize={15} maxSize={30}>
                    <div className="h-full flex flex-col">
                        {/* Sidebar Tabs */}
                        <div className="flex border-b border-white/5 bg-[#1e1e1e]">
                            <button
                                onClick={() => setActiveSidebar('explorer')}
                                className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${activeSidebar === 'explorer' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Explorer
                            </button>
                            <button
                                onClick={() => setActiveSidebar('chat')}
                                className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${activeSidebar === 'chat' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                AI Chat
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {activeSidebar === 'explorer' ? <FileExplorer /> : <ChatInterface />}
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-[#2b2b2b] hover:bg-blue-600 transition-colors" />

                {/* Editor Area */}
                <Panel defaultSize={50} minSize={30}>
                    <PanelGroup orientation="vertical">
                        <Panel defaultSize={showTerminal ? 70 : 100}>
                            <CodeEditor />
                        </Panel>
                        {showTerminal && (
                            <>
                                <PanelResizeHandle className="h-1 bg-[#2b2b2b] hover:bg-blue-600 transition-colors" />
                                <Panel defaultSize={30} minSize={10}>
                                    <div className="h-full bg-black border-t border-white/10 p-2 font-mono text-sm text-gray-300">
                                        {'>'} npm run dev
                                        <br />
                                        Ready in 1234ms
                                    </div>
                                </Panel>
                            </>
                        )}
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="w-1 bg-[#2b2b2b] hover:bg-blue-600 transition-colors" />

                {/* Preview Area */}
                <Panel defaultSize={35} minSize={20}>
                    <PreviewPane />
                </Panel>
            </PanelGroup>
        </div>
    );
}
