import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import dbConnect from "@/lib/mongodb/models/client";
import { BuilderProject } from "@/lib/mongodb/models";
import { User } from "@/lib/mongodb/models";

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

    const project = await BuilderProject.findOne({ _id: id, ownerId: user._id });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    try {
        const body = await req.json();
        const { name, settings } = body;

        const updateData: any = { updatedAt: Date.now() };
        if (name) updateData.name = name;
        if (settings) updateData.settings = settings;

        const project = await BuilderProject.findOneAndUpdate(
            { _id: id, ownerId: user._id },
            { $set: updateData },
            { new: true }
        );

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
