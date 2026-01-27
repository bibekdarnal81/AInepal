import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { User, Service, ChatMessage, GuestChatSession } from '@/lib/mongodb/models'

export async function POST(request: NextRequest) {
    try {
        const { message, userId, guestSessionId, chatHistory } = await request.json()

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        if (!userId && !guestSessionId) {
            return NextResponse.json({ error: 'User ID or Guest Session ID required' }, { status: 400 })
        }

        await dbConnect()

        // Determine if this is a guest or authenticated user
        const isGuest = !!guestSessionId
        let userName = 'Guest'

        if (userId) {
            // Fetch user profile for authenticated users
            const user = await User.findById(userId).select('displayName').lean()
            userName = user?.displayName || 'User'
        } else if (guestSessionId) {
            // Fetch guest session info
            const guestSession = await GuestChatSession.findById(guestSessionId).select('guestName').lean()
            userName = guestSession?.guestName || 'Guest User'
        }

        // Get business context (services)
        const services = await Service.find({ isPublished: true })
            .select('title description price currency')
            .limit(10)
            .lean()

        // Build context for AI
        const businessContext = `
You are an AI assistant for AINepal, a digital agency offering web development, app development, and online courses.

Available Services:
${services.map(s => `- ${s.title}: ${s.description} (${s.currency === 'NPR' ? 'रू' : '$'}${s.price?.toLocaleString() || 0})`).join('\n')}

Current user: ${userName}${isGuest ? ' (Guest User)' : ''}

Previous conversation:
${chatHistory?.map((msg: { is_admin: boolean; message: string }) => `${msg.is_admin ? 'AI' : 'User'}: ${msg.message}`).join('\n') || 'No previous messages'}

Guidelines:
- Be friendly, professional, and helpful
- Answer questions about services, pricing, and projects
- Suggest relevant offerings based on user needs
- Use Nepali Rupees (रू) for pricing
- If you don't know something, suggest talking to a human admin
- Keep responses concise and actionable
- Provide next steps or call-to-action when appropriate
${isGuest ? '- For guest users, you can suggest they register for better service tracking' : ''}
`

        const userMessage = `User question: ${message}\n\nPlease provide a helpful response.`

        // Call Gemini AI API
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            // Fallback response if API key not configured
            return NextResponse.json({
                response: "I'm an AI assistant, but my configuration is incomplete. Please contact our team directly for assistance. You can request to talk to a human admin using the chat!",
                needsHuman: true
            })
        }

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: businessContext + '\n\n' + userMessage
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                    }
                })
            }
        )

        if (!geminiResponse.ok) {
            console.error('Gemini API error:', await geminiResponse.text())
            return NextResponse.json({
                response: "I'm having trouble connecting right now. Would you like to speak with a human admin instead?",
                needsHuman: true
            })
        }

        const geminiData = await geminiResponse.json()
        const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm not sure how to help with that. Would you like me to connect you with a human admin?"

        // Detect if human intervention is needed
        const needsHuman = aiResponse.toLowerCase().includes('talk to human') ||
            aiResponse.toLowerCase().includes('contact our team') ||
            message.toLowerCase().includes('speak to human') ||
            message.toLowerCase().includes('talk to admin')

        // Save AI response to database
        const messageData: {
            message: string;
            isAdmin: boolean;
            isRead: boolean;
            userId?: string;
            guestSessionId?: string;
        } = {
            message: aiResponse,
            isAdmin: true,
            isRead: true
        }

        if (userId) {
            messageData.userId = userId
        } else if (guestSessionId) {
            messageData.guestSessionId = guestSessionId
        }

        try {
            await ChatMessage.create(messageData)
        } catch (insertError) {
            console.error('Error saving AI response:', insertError)
        }

        return NextResponse.json({
            response: aiResponse,
            needsHuman
        })

    } catch (error) {
        console.error('AI Agent error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
