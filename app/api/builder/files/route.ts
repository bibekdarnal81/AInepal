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

export async function GET(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const start = Date.now();
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const parentId = searchParams.get("parentId");

    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Verify project access
    const project = await BuilderProject.findOne({ _id: projectId, ownerId: user._id });
    if (!project) {
        return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const query: any = { projectId };
    if (parentId && parentId !== "undefined" && parentId !== "null") {
        query.parentId = parentId;
    } else {
        query.parentId = { $exists: false };
    }

    const files = await BuilderFile.find(query).exec();

    // Sort: folders first, then files, alphabetically
    const sortedFiles = files.sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sortedFiles);
}

export async function POST(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { projectId, parentId, name, type, content } = body;

        if (!projectId || !name || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const project = await BuilderProject.findOne({ _id: projectId, ownerId: user._id });
        if (!project) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const query: any = { projectId, name, type };
        if (parentId) {
            query.parentId = parentId;
        } else {
            query.parentId = { $exists: false };
        }

        const existing = await BuilderFile.findOne(query);
        if (existing) {
            return NextResponse.json({ error: "File/Folder already exists" }, { status: 409 });
        }

        const newFile = await BuilderFile.create({
            projectId,
            parentId: parentId || undefined,
            name,
            type, // 'file' or 'folder'
            content: type === 'file' ? (content || "") : undefined,
            updatedAt: Date.now(),
        });

        await BuilderProject.findByIdAndUpdate(projectId, { updatedAt: Date.now() });

        return NextResponse.json(newFile);
    } catch (error) {
        console.error("Error creating file:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
