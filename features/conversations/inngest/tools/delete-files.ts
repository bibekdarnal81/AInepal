import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { BuilderFile } from "@/lib/mongodb/models";
import dbConnect from "@/lib/mongodb/client";

const paramsSchema = z.object({
  fileIds: z
    .array(z.string().min(1, "File ID cannot be empty"))
    .min(1, "Provide at least one file ID"),
});

export const createDeleteFilesTool = () => {
  return createTool({
    name: "deleteFiles",
    description:
      "Delete files or folders from the project. If deleting a folder, all contents will be deleted recursively.",
    parameters: z.object({
      fileIds: z
        .array(z.string())
        .describe("Array of file or folder IDs to delete"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }

      const { fileIds } = parsed.data;

      // Validate all files exist before running the step
      const filesToDelete: {
        id: string;
        name: string;
        type: string
      }[] = [];

      await dbConnect();

      for (const fileId of fileIds) {
        try {
          const file = await BuilderFile.findById(fileId);
          if (!file) {
            return `Error: File with ID "${fileId}" not found. Use listFiles to get valid file IDs.`;
          }

          filesToDelete.push({
            id: file._id.toString(),
            name: file.name,
            type: file.type,
          });
        } catch {
          return `Error: Invalid file ID "${fileId}".`;
        }
      }

      try {
        return await toolStep?.run("delete-files", async () => {
          const results: string[] = [];

          // Recursive delete helper
          const deleteRecursive = async (fileId: string) => {
            const file = await BuilderFile.findById(fileId);
            if (!file) return;

            // If folder, find children and delete them recursively
            if (file.type === "folder") {
              const children = await BuilderFile.find({ parentId: fileId });
              for (const child of children) {
                await deleteRecursive(child._id.toString());
              }
            }

            // Delete the file itself
            await BuilderFile.findByIdAndDelete(fileId);
          };

          for (const file of filesToDelete) {
            await deleteRecursive(file.id);
            results.push(`Deleted ${file.type} "${file.name}" successfully`);
          }

          return results.join("\n");
        });
      } catch (error) {
        return `Error deleting files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  });
};
