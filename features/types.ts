
export interface Project {
    _id: string;
    name: string;
    ownerId: string;
    updatedAt: number;
    importStatus?: "importing" | "completed" | "failed";
    exportStatus?: "exporting" | "completed" | "failed" | "cancelled";
    exportRepoUrl?: string;
    settings?: {
        installCommand?: string;
        devCommand?: string;
    };
    createdAt?: Date; // Mongoose adds this
}

export interface BuilderFile {
    _id: string;
    projectId: string;
    parentId?: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    storageId?: string;
    updatedAt: number;
}

export interface Conversation {
    _id: string;
    projectId: string;
    title: string;
    updatedAt: number;
}

export interface Message {
    _id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    status?: 'processing' | 'completed' | 'cancelled';
    createdAt?: string;
}

// Compatibility types for Convex migration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Id<_T extends string> = string;
export type Doc<T extends "projects" | "files" | "conversations" | "messages"> =
    T extends "projects" ? Project :
    T extends "files" ? BuilderFile :
    T extends "conversations" ? Conversation :
    T extends "messages" ? Message :
    never;
