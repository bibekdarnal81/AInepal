import dbConnect from './lib/mongodb/client'
import { ChatMessage, GuestChatSession, User } from './lib/mongodb/models'

async function checkChat() {
    await dbConnect()
    
    const messages = await ChatMessage.find().lean()
    console.log('Total ChatMessages:', messages.length)
    if (messages.length > 0) {
        console.log('Sample messages:', JSON.stringify(messages.slice(0, 3), null, 2))
    }
    
    const guestSessions = await GuestChatSession.find().lean()
    console.log('Total GuestChatSessions:', guestSessions.length)
    
    const users = await User.find({ isAdmin: { $ne: true } }).select('_id displayName email').lean()
    console.log('Total non-admin users:', users.length)
    
    process.exit(0)
}

checkChat().catch(console.error)
