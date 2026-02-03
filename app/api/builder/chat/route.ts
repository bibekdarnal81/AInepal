import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/mongodb/client";
import { BuilderFile, BuilderProject, BuilderMessage, User } from "@/lib/mongodb/models";

export const maxDuration = 300;

async function getAuthUser() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return null;
    }
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    return user;
}

const CODING_AGENT_SYSTEM_PROMPT = `<identity>
You are Polaris, an expert AI coding assistant. You help users by reading, creating, updating, and organizing files in their projects.
</identity>

<workflow>
1. Call listFiles to see the current project structure. Note the IDs of folders you need.
2. Call readFiles to understand existing code when relevant.
3. Execute ALL necessary changes:
   - Create folders first to get their IDs
   - Use createFiles to batch create multiple files in the same folder (more efficient)
4. After completing ALL actions, verify by calling listFiles again.
5. Provide a final summary of what you accomplished.
</workflow>

<rules>
- When creating files inside folders, use the folder's ID (from listFiles) as parentId.
- Use empty string for parentId when creating at root level.
- Complete the ENTIRE task before responding. If asked to create an app, create ALL necessary files (package.json, config files, source files, components, etc.).
- Do not stop halfway. Do not ask if you should continue. Finish the job.
- Never say "Let me...", "I'll now...", "Now I will..." - just execute the actions silently.
</rules>

<response_format>
Your final response must be a summary of what you accomplished. Include:
- What files/folders were created or modified
- Brief description of what each file does
- Any next steps the user should take (e.g., "run npm install")

Do NOT include intermediate thinking or narration. Only provide the final summary after all work is complete.
</response_format>`;

export async function POST(req: Request) {
    const user = await getAuthUser();
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { messages, projectId, conversationId } = await req.json();

    if (!projectId || !conversationId) {
        return new Response("Missing projectId or conversationId", { status: 400 });
    }

    // Verify project access
    const project = await BuilderProject.findOne({ _id: projectId, ownerId: user._id });
    if (!project) {
        return new Response("Project not found", { status: 404 });
    }

    // Save user message
    const lastMessage = messages[messages.length - 1];
    await BuilderMessage.create({
        conversationId,
        projectId,
        role: 'user',
        content: lastMessage.content,
        status: 'completed'
    });

    const result = streamText({
        model: anthropic('claude-3-5-sonnet-20240620'),
        system: CODING_AGENT_SYSTEM_PROMPT,
        messages,
        tools: {
            listFiles: tool({
                description: 'List all files and folders in the project',
                execute: async () => {
                    const files = await BuilderFile.find({ projectId });
                    return files.map(f => ({
                        id: f._id.toString(),
                        name: f.name,
                        type: f.type,
                        parentId: f.parentId?.toString()
                    }));
                },
                inputSchema: z.object({}),
            }),
            readFiles: tool({
                description: 'Read the content of specific files',
                execute: async ({ fileIds }) => {
                    const files = await BuilderFile.find({
                        projectId,
                        _id: { $in: fileIds },
                        type: 'file'
                    });
                    return files.map(f => ({
                        id: f._id.toString(),
                        name: f.name,
                        content: f.content
                    }));
                },
                inputSchema: z.object({
                    fileIds: z.array(z.string()).describe('The IDs of the files to read'),
                }),
            }),
            createFiles: tool({
                description: 'Create multiple files at once',
                execute: async ({ files, parentId }) => {
                    const results = [];
                    for (const file of files) {
                        try {
                            const newFile = await BuilderFile.create({
                                projectId,
                                parentId: parentId || undefined,
                                name: file.name,
                                type: 'file',
                                content: file.content,
                                updatedAt: Date.now()
                            });
                            results.push({ name: file.name, id: newFile._id.toString(), status: 'created' });
                        } catch (_e) {
                            results.push({ name: file.name, error: 'Failed to create' });
                        }
                    }
                    await BuilderProject.findByIdAndUpdate(projectId, { updatedAt: Date.now() });
                    return results;
                },
                inputSchema: z.object({
                    files: z.array(z.object({
                        name: z.string(),
                        content: z.string(),
                    })),
                    parentId: z.string().optional().describe('The ID of the parent folder (optional)'),
                }),
            }),
            createFolder: tool({
                description: 'Create a new folder',
                execute: async ({ name, parentId }) => {
                    const newFolder = await BuilderFile.create({
                        projectId,
                        parentId: parentId || undefined,
                        name,
                        type: 'folder',
                        updatedAt: Date.now()
                    });
                    await BuilderProject.findByIdAndUpdate(projectId, { updatedAt: Date.now() });
                    return { id: newFolder._id.toString(), name };
                },
                inputSchema: z.object({
                    name: z.string(),
                    parentId: z.string().optional(),
                }),
            }),
            updateFile: tool({
                description: 'Update the content of a file',
                execute: async ({ fileId, content }) => {
                    await BuilderFile.findOneAndUpdate(
                        { _id: fileId, projectId },
                        { content, updatedAt: Date.now() }
                    );
                    await BuilderProject.findByIdAndUpdate(projectId, { updatedAt: Date.now() });
                    return { success: true };
                },
                inputSchema: z.object({
                    fileId: z.string(),
                    content: z.string(),
                }),
            }),
            deleteFiles: tool({
                description: 'Delete files or folders recursively',
                execute: async ({ fileIds }) => {
                    // Recursive delete helper
                    const deleteRecursive = async (fid: string) => {
                        const file = await BuilderFile.findById(fid);
                        if (!file) return;
                        if (file.type === 'folder') {
                            const children = await BuilderFile.find({ parentId: fid });
                            for (const child of children) {
                                await deleteRecursive(child._id.toString());
                            }
                        }
                        await BuilderFile.findByIdAndDelete(fid);
                    };

                    for (const id of fileIds) {
                        await deleteRecursive(id);
                    }
                    await BuilderProject.findByIdAndUpdate(projectId, { updatedAt: Date.now() });
                    return { success: true };
                },
                inputSchema: z.object({
                    fileIds: z.array(z.string()),
                }),
            }),
            renameFile: tool({
                description: 'Rename a file or folder',
                execute: async ({ fileId, newName }) => {
                    await BuilderFile.findOneAndUpdate(
                        { _id: fileId, projectId },
                        { name: newName, updatedAt: Date.now() }
                    );
                    await BuilderProject.findByIdAndUpdate(projectId, { updatedAt: Date.now() });
                    return { success: true };
                },
                inputSchema: z.object({
                    fileId: z.string(),
                    newName: z.string(),
                }),
            }),
        },
        onFinish: async ({ text }) => {
            // Save assistant response
            await BuilderMessage.create({
                conversationId,
                projectId,
                role: 'assistant',
                content: text,
                status: 'completed'
            });
        }
    });

    return result.toTextStreamResponse();
}
