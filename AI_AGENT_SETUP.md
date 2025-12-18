# AI Chat Agent Setup Guide

## Quick Start

Your live chat now has AI-powered automatic responses! Follow these steps to activate it:

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Add to Environment Variables

Open your `.env.local` file and add:

```bash
# AI Agent Configuration
GEMINI_API_KEY=your_api_key_here
```

### 3. Run Database Migration

Execute the migration to add AI tracking fields:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase dashboard
```

The migration file is at: `supabase/migrations/20251218004500_add_ai_agent.sql`

### 4. Restart Your Dev Server

```bash
npm run dev
```

## Features

### For Users

- **AI Toggle**: Click the sparkle (✨) icon in the chat header to enable/disable AI
- **Instant Responses**: AI answers common questions automatically
- **Smart Handoff**: AI knows when to suggest talking to a human
- **Visual Indicators**: 
  - Purple bot avatar for AI messages
  - Blue/cyan avatar for human admin messages
  - Animated typing dots when AI is responding

### For Business

The AI knows about:
- All your published services, with pricing
- Your portfolio projects
- Available courses
- How to recommend the right offering
- When to escalate to human support

## Testing

1. Open the chat widget on your site
2. Send a message like "How much does web development cost?"
3. The AI should respond automatically with pricing info
4. Try: "I need a custom app" or "Tell me about your services"

## Customization

### Adjust AI Behavior

Edit `app/api/ai-agent/route.ts` to customize:
- Response tone and style
- Business context and information
- When to suggest human handoff
- Response length limits

### Change AI Model

In the API route, update the model:
```typescript
// Current: gemini-1.5-flash (fast, cost-effective)
// Alternative: gemini-1.5-pro (more capable, slower)
```

## Troubleshooting

**AI not responding?**
- Check that `GEMINI_API_KEY` is set in `.env.local`
- Verify the sparkle icon shows yellow (AI enabled)
- Check browser console for errors

**Wrong information in responses?**
- Update the business context in the AI agent API route
- Add more specific product information
- Adjust the system prompt

**Too slow?**
- Using `gemini-1.5-flash` (fastest)
- Consider caching common responses
- Reduce `maxOutputTokens` in config

## Cost Management

**Free Tier**: 15 requests/minute, 1M tokens/day  
**Typical usage**: ~200 conversations/day free

Monitor at: [Google AI Studio](https://makersuite.google.com/)

## Next Steps

1. Train the AI with your specific FAQs
2. Monitor conversations in admin panel
3. Adjust prompts based on user feedback
4. Consider adding sentiment analysis
5. Implement conversation categorization

## Support

The AI agent integrates seamlessly with your existing chat system. Human admins can still respond manually at any time, and all messages are saved to your database for review.
