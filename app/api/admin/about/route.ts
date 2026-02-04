import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { About } from '@/lib/mongodb/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

// Helper to check admin status
const isAdmin = (session: any) => {
    return session?.user?.isAdmin || session?.user?.email === process.env.ADMIN_EMAIL || session?.user?.email === 'admin@example.com';
};

export async function GET() {
    try {
        await dbConnect();
        const about = await About.findOne().lean();
        return NextResponse.json(about || {});
    } catch (error) {
        console.error('Error fetching about data:', error);
        return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();

        // Remove _id and timestamps to avoid conflicts if they exist in payload
        delete data._id;
        delete data.createdAt;
        delete data.updatedAt;

        // Upsert the single About document
        const about = await About.findOneAndUpdate(
            {},
            { $set: data },
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json(about);
    } catch (error: any) {
        console.error('Error updating about data:', error);
        return NextResponse.json({ error: error.message || 'Failed to update about data' }, { status: 500 });
    }
}
