
import { useBuilderFiles } from "../../../hooks/use-builder";
import { Id } from "../../types";

export const useFiles = (projectId: Id<"projects"> | null) => {
  return useBuilderFiles(projectId || undefined);
};

export const useFile = (_fileId: Id<"files"> | null) => {
  // This hook expects a specific file. We should probably add this to use-builder.ts or fetch here.
  // For now, returning null/loading if not implemented, or use simple fetch.
  // We'll trust that useBuilderFiles is used mostly for folder contents.
  // Ideally we implement useBuilderFile(fileId).
  return undefined; // Placeholder if not used heavily or fix later
};

export const useFilePath = (_fileId: Id<"files"> | null) => {
  // Placeholder for breadcrumbs
  return [];
};

export const useUpdateFile = () => {
  return async (args: { id: Id<"files">; content: string }) => {
    const res = await fetch(`/api/builder/files/${args.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: args.content })
    });
    if (!res.ok) throw new Error('Failed to update file');
  };
};

export const useCreateFile = () => {
  return async (args: { projectId: Id<"projects">; parentId?: Id<"files">; name: string; content?: string }) => {
    const res = await fetch(`/api/builder/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...args, type: 'file' })
    });
    if (!res.ok) throw new Error('Failed to create file');
    window.dispatchEvent(new Event('builder-files-updated')); // Need to listen to this in useBuilderFiles
    return await res.json();
  };
};

export const useCreateFolder = () => {
  return async (args: { projectId: Id<"projects">; parentId?: Id<"files">; name: string }) => {
    const res = await fetch(`/api/builder/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...args, type: 'folder' })
    });
    if (!res.ok) throw new Error('Failed to create folder');
    window.dispatchEvent(new Event('builder-files-updated'));
    return await res.json();
  };
};

export const useRenameFile = () => {
  return async (args: { id: Id<"files">; newName: string }) => {
    const res = await fetch(`/api/builder/files/${args.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: args.newName })
    });
    if (!res.ok) throw new Error('Failed to rename file');
    window.dispatchEvent(new Event('builder-files-updated'));
  };
};

export const useDeleteFile = () => {
  return async (args: { id: Id<"files"> }) => {
    const res = await fetch(`/api/builder/files/${args.id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete file');
    window.dispatchEvent(new Event('builder-files-updated'));
  };
};

export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
  enabled?: boolean;
}) => {
  const { files } = useBuilderFiles(enabled ? projectId : undefined, parentId);
  return files;
};
