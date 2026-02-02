
import { useBuilderConversations, useBuilderMessages } from "../../../hooks/use-builder";
import { Id, Conversation } from "../../types";
import { useState, useEffect } from "react";

export const useConversation = (id: Id<"conversations"> | null) => {
  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/builder/conversations/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(setConversation);
  }, [id]);
  return conversation;
};

export const useMessages = (conversationId: Id<"conversations"> | null) => {
  const { messages } = useBuilderMessages(conversationId || undefined);
  return messages;
};

export const useConversations = (projectId: Id<"projects">) => {
  const { conversations } = useBuilderConversations(projectId);
  return conversations;
};

export const useCreateConversation = () => {
  return async (args: { projectId: Id<"projects">; title: string }) => {
    const res = await fetch('/api/builder/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    // Trigger update? useBuilderConversations needs to listen.
    // We'll implement listener in use-builder.ts similarly.
    return await res.json();
  };
};
