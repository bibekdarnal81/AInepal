import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { Id } from "../../../types";
import { BuilderFile } from "@/lib/mongodb/models";
import dbConnect from "@/lib/mongodb/client";

interface CreateFilesToolOptions {
  projectId: Id<"projects">;
}

const paramsSchema = z.object({
  parentId: z.string(),
  files: z
    .array(
      z.object({
        name: z.string().min(1, "File name cannot be empty"),
        content: z.string(),
      })
    )
    .min(1, "Provide at least one file to create"),
});

export const createCreateFilesTool = ({
  projectId,
}: CreateFilesToolOptions) => {
  return createTool({
    name: "createFiles",
    description:
      "Create multiple files at once in the same folder. Use this to batch create files that share the same parent folder. More efficient than creating files one by one.",
    parameters: z.object({
      parentId: z
        .string()
        .describe(
          "The ID of the parent folder. Use empty string for root level. Must be a valid folder ID from listFiles."
        ),
      files: z
        .array(
          z.object({
            name: z.string().describe("The file name including extension"),
            content: z.string().describe("The file content"),
          })
        )
        .describe("Array of files to create"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }

      const { parentId, files } = parsed.data;

      try {
        return await toolStep?.run("create-files", async () => {
          await dbConnect();
          let resolvedParentId: string | undefined;

          if (parentId && parentId !== "") {
            try {
              resolvedParentId = parentId;
              const parentFolder = await BuilderFile.findById(resolvedParentId);

              if (!parentFolder) {
                return `Error: Parent folder with ID "${parentId}" not found. Use listFiles to get valid folder IDs.`;
              }
              if (parentFolder.type !== "folder") {
                return `Error: The ID "${parentId}" is a file, not a folder. Use a folder ID as parentId.`;
              }
            } catch {
              return `Error: Invalid parentId "${parentId}". Use listFiles to get valid folder IDs, or use empty string for root level.`;
            }
          }

          const results = [];

          for (const file of files) {
            try {
              // Check if file already exists in this location
              const query: any = { projectId, name: file.name, type: "file" };
              if (resolvedParentId) {
                query.parentId = resolvedParentId;
              } else {
                query.parentId = { $exists: false };
              }

              const existing = await BuilderFile.findOne(query);

              if (existing) {
                results.push({ name: file.name, error: "File already exists" });
                continue;
              }

              await BuilderFile.create({
                projectId,
                name: file.name,
                content: file.content,
                type: "file",
                parentId: resolvedParentId,
                updatedAt: Date.now(),
              });

              results.push({ name: file.name, fileId: "created" });
            } catch (err) {
              results.push({ name: file.name, error: err instanceof Error ? err.message : "Unknown error" });
            }
          }

          const created = results.filter((r) => !r.error);
          const failed = results.filter((r) => r.error);

          let response = `Created ${created.length} file(s)`;
          if (created.length > 0) {
            response += `: ${created.map((r) => r.name).join(", ")}`;
          }
          if (failed.length > 0) {
            response += `. Failed: ${failed.map((r) => `${r.name} (${r.error})`).join(", ")}`;
          }

          return response;
        });
      } catch (error) {
        return `Error creating files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  });
};
