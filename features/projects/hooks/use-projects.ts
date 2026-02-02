
import { useBuilderProjects, useBuilderProject } from "../../../hooks/use-builder";
import { Id } from "../../types";

export const useProject = (projectId: Id<"projects">) => {
  return useBuilderProject(projectId);
};

export const useProjects = () => {
  return useBuilderProjects();
};

export const useProjectsPartial = (limit: number) => {
  // We fetch all projects but we could limit in UI or add limit param to hook
  const { projects, ...rest } = useBuilderProjects();
  const limitedProjects = projects?.slice(0, limit);
  return { ...rest, projects: limitedProjects };
};

export const useCreateProject = () => {
  // We return a simple async function instead of useMutation object
  return async (args: { name: string }) => {
    const res = await fetch('/api/builder/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    if (!res.ok) throw new Error('Failed to create project');

    // Trigger global update
    window.dispatchEvent(new Event('builder-project-updated'));

    return await res.json();
  };
};

export const useRenameProject = () => {
  return async (args: { id: Id<"projects">; name: string }) => {
    const res = await fetch(`/api/builder/projects/${args.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: args.name })
    });
    if (!res.ok) throw new Error('Failed to rename project');

    window.dispatchEvent(new Event('builder-project-updated'));
  };
};

export const useUpdateProjectSettings = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (args: { id: Id<"projects">; settings: any }) => {
    const res = await fetch(`/api/builder/projects/${args.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: args.settings })
    });
    if (!res.ok) throw new Error('Failed to update project settings');
    window.dispatchEvent(new Event('builder-project-updated'));
  };
};
