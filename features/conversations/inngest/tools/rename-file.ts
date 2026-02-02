import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { BuilderFile } from "@/lib/mongodb/models";
import dbConnect from "@/lib/mongodb/client";

const paramsSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  newName: z.string().min(1, "New name is required"),
});

export const createRenameFileTool = () => {
  return createTool({
    name: "renameFile",
    description: "Rename a file or folder",
    parameters: z.object({
      fileId: z.string().describe("The ID of the file or folder to rename"),
      newName: z.string().describe("The new name for the file or folder"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }

      const { fileId, newName } = parsed.data;

      try {
        return await toolStep?.run("rename-file", async () => {
          await dbConnect();

          try {
            const file = await BuilderFile.findById(fileId);

            if (!file) {
              return `Error: File with ID "${fileId}" not found. Use listFiles to get valid file IDs.`;
            }

            // Check for name collision in the same folder
            const existing = await BuilderFile.findOne({
              projectId: file.projectId,
              parentId: file.parentId, // use undefined if null in DB if logic differs, but mongoose handles this usually
              name: newName,
              type: file.type
            });

            // We need to exclude the current file from the check, logically findOne might return self if name didn't change (edge case)
            if (existing && existing._id.toString() !== fileId) {
              return `Error: A ${file.type} named "${newName}" already exists in the same folder.`;
            }

            await BuilderFile.findByIdAndUpdate(fileId, {
              name: newName,
              updatedAt: Date.now()
            });

            return `Renamed "${file.name}" to "${newName}" successfully`;
          } catch {
            return `Error: Invalid file ID "${fileId}".`;
          }
        })
      } catch (error) {
        return `Error renaming file: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  });
};
