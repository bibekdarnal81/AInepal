
import { useState, useEffect, useCallback } from 'react';
import { Project, BuilderFile, Conversation, Message } from '../features/types';

// Hook to fetch projects
export function useBuilderProjects() {
    const [projects, setProjects] = useState<Project[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/builder/projects');
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();

        const handleUpdate = () => fetchProjects();
        window.addEventListener('builder-project-updated', handleUpdate);
        return () => window.removeEventListener('builder-project-updated', handleUpdate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { projects, isLoading, error, mutate: fetchProjects };
}

// Hook to fetch a single project
export function useBuilderProject(id?: string) {
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(!!id);

    useEffect(() => {
        if (!id) {
            // eslint-disable-next-line
            setIsLoading(false);
            setProject(undefined);
            return;
        }

        let mounted = true;
        setIsLoading(true);
        fetch(`/api/builder/projects/${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (mounted) setProject(data);
            })
            .catch(console.error)
            .finally(() => {
                if (mounted) setIsLoading(false);
            });

        return () => { mounted = false; };
    }, [id]);

    return { project, isLoading };
}

// Hook to fetch files
export function useBuilderFiles(projectId?: string, parentId?: string) {
    const [files, setFiles] = useState<BuilderFile[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFiles = useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ projectId });
            if (parentId) params.append('parentId', parentId);

            const res = await fetch(`/api/builder/files?${params}`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, parentId]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return { files, isLoading, mutate: fetchFiles };
}

// Hook to fetch conversations
export function useBuilderConversations(projectId?: string) {
    const [conversations, setConversations] = useState<Conversation[] | undefined>(undefined);

    const fetchConversations = useCallback(async () => {
        if (!projectId) return;
        const res = await fetch(`/api/builder/conversations?projectId=${projectId}`);
        if (res.ok) setConversations(await res.json());
    }, [projectId]);

    useEffect(() => {
        // eslint-disable-next-line
        fetchConversations();
    }, [fetchConversations]);

    return { conversations, mutate: fetchConversations };
}

// Hook to fetch messages
export function useBuilderMessages(conversationId?: string) {
    const [messages, setMessages] = useState<Message[] | undefined>(undefined);

    const fetchMessages = useCallback(async () => {
        if (!conversationId) return;
        const res = await fetch(`/api/builder/conversations/${conversationId}/messages`);
        if (res.ok) setMessages(await res.json());
    }, [conversationId]);

    useEffect(() => {
        // eslint-disable-next-line
        fetchMessages();
    }, [fetchMessages]);

    return { messages, mutate: fetchMessages };
}
