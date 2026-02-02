import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { BuilderFile } from "@/lib/mongodb/models";
import dbConnect from "@/lib/mongodb/client";

const paramsSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  content: z.string(),
});

export const createUpdateFileTool = () => {
  return createTool({
    name: "updateFile",
    description: "Update the content of an existing file",
    parameters: z.object({
      fileId: z.string().describe("The ID of the file to update"),
      content: z.string().describe("The new content for the file"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }

      const { fileId, content } = parsed.data;

      try {
        return await toolStep?.run("update-file", async () => {
          await dbConnect();

          // Validate file exists before running the step
          try {
            const file = await BuilderFile.findById(fileId);

            if (!file) {
              return `Error: File with ID "${fileId}" not found. Use listFiles to get valid file IDs.`;
            }

            if (file.type === "folder") {
              return `Error: "${fileId}" is a folder, not a file. You can only update file contents.`;
            }

            await BuilderFile.findByIdAndUpdate(fileId, {
              content,
              updatedAt: Date.now()
            });

            return `File "${file.name}" updated successfully`;
          } catch {
            return `Error: Invalid file ID "${fileId}".`;
          }
        })
      } catch (error) {
        return `Error update file: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  });
};
