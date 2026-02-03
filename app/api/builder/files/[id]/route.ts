import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/mongodb/models/client";
import { BuilderFile, BuilderProject, User } from "@/lib/mongodb/models";

async function getAuthUser() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return null;
    }
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    return user;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const file = await BuilderFile.findById(id);
    if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const project = await BuilderProject.findOne({ _id: file.projectId, ownerId: user._id });
    if (!project) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(file);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    try {
        const body = await req.json();
        const { name, content } = body;

        const file = await BuilderFile.findById(id);
        if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

        const project = await BuilderProject.findOne({ _id: file.projectId, ownerId: user._id });
        if (!project) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        if (name) {
            // Check for duplicates
            const query: any = {
                projectId: file.projectId,
                name,
                type: file.type,
                _id: { $ne: id }
            };
            if (file.parentId) query.parentId = file.parentId;
            else query.parentId = { $exists: false };

            const existing = await BuilderFile.findOne(query);
            if (existing) {
                return NextResponse.json({ error: "Name already exists" }, { status: 409 });
            }
        }

        const updateData: any = { updatedAt: Date.now() };
        if (name) updateData.name = name;
        if (content !== undefined) updateData.content = content;

        const updatedFile = await BuilderFile.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        await BuilderProject.findByIdAndUpdate(file.projectId, { updatedAt: Date.now() });

        return NextResponse.json(updatedFile);
    } catch (error) {
        console.error("Error updating file:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function deleteRecursive(fileId: string) {
    const file = await BuilderFile.findById(fileId);
    if (!file) return;

    if (file.type === 'folder') {
        const children = await BuilderFile.find({ parentId: fileId });
        for (const child of children) {
            await deleteRecursive(child._id.toString());
        }
    }

    await BuilderFile.findByIdAndDelete(fileId);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const file = await BuilderFile.findById(id);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const project = await BuilderProject.findOne({ _id: file.projectId, ownerId: user._id });
    if (!project) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    try {
        await deleteRecursive(id);
        await BuilderProject.findByIdAndUpdate(file.projectId, { updatedAt: Date.now() });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
