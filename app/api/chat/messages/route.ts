import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { ChatMessage } from '@/lib/mongodb/models';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const guestSessionId = searchParams.get('guestSessionId');

        if (!userId && !guestSessionId) {
            return NextResponse.json(
                { error: 'userId or guestSessionId is required' },
                { status: 400 }
            );
        }

        const query: Record<string, unknown> = {};
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
            query.userId = new mongoose.Types.ObjectId(userId);
        }
        if (guestSessionId) {
            if (!mongoose.Types.ObjectId.isValid(guestSessionId)) return NextResponse.json({ error: 'Invalid guestSessionId' }, { status: 400 });
            query.guestSessionId = new mongoose.Types.ObjectId(guestSessionId);
        }

        const messages = await ChatMessage.find(query)
            .sort({ createdAt: 1 })
            .lean();

        // Transform for frontend compatibility if needed
        const typedMessages = messages as unknown as Array<{
            _id: mongoose.Types.ObjectId
            message: string
            isAdmin: boolean
            isRead: boolean
            imageUrl?: string
            createdAt: Date
        }>
        const transformedMessages = typedMessages.map((msg) => ({
            id: msg._id.toString(),
            message: msg.message,
            is_admin: msg.isAdmin,
            is_read: msg.isRead,
            created_at: msg.createdAt,
            // Map the single imageUrl to the attachments array expected by the frontend
            attachments: msg.imageUrl ? [{
                file_url: msg.imageUrl,
                file_type: 'image/jpeg', // Assumption since we only store URL
            }] : []
        }));

        return NextResponse.json(transformedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { message, userId, guestSessionId, imageUrl, isAdmin } = body;

        console.log('Chat message POST:', { userId, guestSessionId, message: message?.substring(0, 50) });

        if (!message && !imageUrl) {
            return NextResponse.json(
                { error: 'Message or image is required' },
                { status: 400 }
            );
        }

        // Validate userId if provided
        if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid userId format:', userId);
            return NextResponse.json(
                { error: 'Invalid userId format' },
                { status: 400 }
            );
        }

        const newMessage = await ChatMessage.create({
            userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
            guestSessionId: guestSessionId ? new mongoose.Types.ObjectId(guestSessionId) : undefined,
            message: message || (imageUrl ? '📷 Image' : ''),
            imageUrl,
            isAdmin: isAdmin || false,
            isRead: false
        });

        console.log('Chat message created:', newMessage._id.toString(), 'userId:', newMessage.userId?.toString());

        return NextResponse.json({
            id: newMessage._id.toString(),
            message: newMessage.message,
            is_admin: newMessage.isAdmin,
            is_read: newMessage.isRead,
            created_at: newMessage.createdAt,
            attachments: newMessage.imageUrl ? [{
                file_url: newMessage.imageUrl,
                file_type: 'image/jpeg'
            }] : []
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
