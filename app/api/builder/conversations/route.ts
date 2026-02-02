import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb/models/client";
import { BuilderConversation, BuilderProject, User } from "@/lib/mongodb/models";

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

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Verify project access
    const project = await BuilderProject.findOne({ _id: projectId, ownerId: user._id });
    if (!project) {
        return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const conversations = await BuilderConversation.find({ projectId }).sort({ updatedAt: -1 });
    return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, title } = body;

    const project = await BuilderProject.findOne({ _id: projectId, ownerId: user._id });
    if (!project) {
        return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const conversation = await BuilderConversation.create({
        projectId,
        title: title || "New Chat",
        updatedAt: Date.now()
    });

    return NextResponse.json(conversation);
}
