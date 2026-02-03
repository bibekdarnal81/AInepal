import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { ChatProject } from '@/lib/mongodb/models'

// GET - Fetch user's chat projects (folders)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const projects = await ChatProject.find({
            userId: session.user.id
        })
            .sort({ updatedAt: -1 })
            .lean()

        return NextResponse.json({
            projects: projects.map(p => ({
                id: p._id.toString(),
                name: p.name,
                updatedAt: p.updatedAt,
                createdAt: p.createdAt,
            }))
        })
    } catch (error) {
        console.error('Error fetching chat projects:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

// POST - Create a new chat project (folder)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const body = await req.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
        }

        const project = await ChatProject.create({
            userId: session.user.id,
            name,
        })

        return NextResponse.json({
            id: project._id.toString(),
            name: project.name,
            createdAt: project.createdAt,
        })
    } catch (error) {
        console.error('Error creating chat project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}
