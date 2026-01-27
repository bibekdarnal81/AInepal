import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { AIModelApiKey, User } from '@/lib/mongodb/models'
import { decryptApiKey } from '@/lib/ai-encryption'
import { generateImageOpenAI } from '@/lib/ai-providers'
import { deductCredits } from '@/lib/credits'

async function getGeminiApiKey(): Promise<string | null> {
    await dbConnect()

    // Try to get from database first
    const keyRecord = await AIModelApiKey.findOne({ provider: 'google' }).lean()

    if (keyRecord && keyRecord.encryptedApiKey && keyRecord.encryptionIv) {
        try {
            return decryptApiKey(keyRecord.encryptedApiKey, keyRecord.encryptionIv)
        } catch (err) {
            console.error('Failed to decrypt API key:', err)
        }
    }

    // Fallback to environment variable
    return process.env.GEMINI_API_KEY || null
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check user advancedCredits
        await dbConnect()
        const user = await User.findById(session.user.id)
        if (!user || (user.advancedCredits || 0) < 5) {
            return NextResponse.json({ error: 'Insufficient advanced credits', message: 'You need at least 5 advanced credits to generate images.' }, { status: 403 })
        }

        const { prompt, model, style, aspectRatio, imageCount, referenceImage } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        // Determine provider
        let provider = 'google'
        if (model && (model.includes('gpt') || model.includes('dall-e') || model.includes('openai'))) {
            provider = 'openai'
        }

        if (provider === 'openai') {
            await dbConnect()
            const keyRecord = await AIModelApiKey.findOne({ provider: 'openai' }).lean()
            let apiKey = ''
            if (keyRecord && keyRecord.encryptedApiKey && keyRecord.encryptionIv) {
                try {
                    apiKey = decryptApiKey(keyRecord.encryptedApiKey, keyRecord.encryptionIv)
                } catch (err) {
                    console.error('Failed to decrypt OpenAI API key:', err)
                }
            }

            if (!apiKey) {
                return NextResponse.json({
                    error: 'OpenAI API key not configured',
                    message: 'Please add your OpenAI API key in Admin > AI Models > API Keys'
                }, { status: 500 })
            }

            // Map model names
            let openaiModel = 'dall-e-3'
            if (model === 'gpt_image_1') openaiModel = 'dall-e-3' // Default to DALL-E 3 for "GPT Image 1"
            if (model.includes('dall-e-2')) openaiModel = 'dall-e-2'

            try {
                // OpenAI Size Logic (DALL-E 3 supports 1024x1024, 1024x1792, 1792x1024)
                let size = "1024x1024"
                if (openaiModel === 'dall-e-3') {
                    if (aspectRatio === "16:9") size = "1792x1024"
                    if (aspectRatio === "9:16") size = "1024x1792"
                } else {
                    // DALL-E 2 supports 256x256, 512x512, 1024x1024
                    // Default is fine
                }

                // Enhanced prompt with style if needed
                let finalPrompt = prompt
                if (style && style !== 'auto') {
                    finalPrompt = `${style} style: ${prompt}`
                }

                const images = await generateImageOpenAI(apiKey, openaiModel, finalPrompt, size, 1) // DALL-E 3 only 1 image



                // Deduct credits (5 credits per image)
                await deductCredits(session.user.id, 5, `Generated image with ${openaiModel}`, {
                    model: openaiModel,
                    images: images.map((img: any) => img.url)
                })

                return NextResponse.json({
                    success: true,
                    images: images.map((img: any) => img.url),
                    model: openaiModel,
                    count: images.length
                })
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error'
                return NextResponse.json({
                    success: false,
                    error: 'OpenAI generation failed',
                    message
                }, { status: 500 })
            }
        }

        // --- GEMINI IMPLEMENTATION (Fallback) ---
        const apiKey = await getGeminiApiKey()
        if (!apiKey) {
            return NextResponse.json({
                error: 'Gemini API key not configured',
                message: 'Please add your Google Gemini API key in Admin > AI Models > API Keys'
            }, { status: 500 })
        }

        // Build the enhanced prompt with style
        let enhancedPrompt = prompt
        if (style && style !== 'auto') {
            enhancedPrompt = `Create an image in ${style} style: ${prompt}`
        } else {
            enhancedPrompt = `Create an image: ${prompt}`
        }

        // Add aspect ratio hint to prompt
        if (aspectRatio === "16:9") {
            enhancedPrompt += ". Make it landscape/widescreen format."
        } else if (aspectRatio === "9:16") {
            enhancedPrompt += ". Make it portrait/vertical format."
        }

        console.log('Generating image with prompt:', enhancedPrompt)

        // List of models to try in order of preference
        const modelsToTry = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ]

        let lastError: string | null = null
        const images: string[] = []

        for (const modelName of modelsToTry) {
            console.log(`Trying model: ${modelName}`)

            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: enhancedPrompt
                                }]
                            }],
                            generationConfig: modelName === 'gemini-2.0-flash-exp'
                                ? { responseModalities: ["IMAGE", "TEXT"] }
                                : { temperature: 0.9, maxOutputTokens: 2000 }
                        })
                    }
                )

                // Handle rate limit - wait and retry or try next model
                if (response.status === 429) {
                    const errorData = await response.json() as {
                        error?: {
                            message?: string
                            details?: Array<{ ['@type']?: string; retryDelay?: string }>
                        }
                    }
                    console.log(`Rate limited on ${modelName}:`, errorData.error?.message)

                    // Extract retry delay if available
                    const retryInfo = errorData.error?.details?.find((detail) => detail['@type']?.includes('RetryInfo'))
                    const retryDelay = retryInfo?.retryDelay
                    if (retryDelay) {
                        const waitSeconds = parseInt(retryDelay) || 30
                        lastError = `Rate limited. Please wait ${waitSeconds} seconds and try again.`
                    } else {
                        lastError = 'API quota exceeded. Please wait a moment and try again.'
                    }
                    continue // Try next model
                }

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error(`Error with ${modelName}:`, errorText)
                    lastError = errorText
                    continue // Try next model
                }

                const data = await response.json()
                console.log(`Response from ${modelName}:`, JSON.stringify(data).substring(0, 500))

                // Extract images from response
                const candidates = data.candidates || []

                for (const candidate of candidates) {
                    const parts = candidate.content?.parts || []
                    for (const part of parts) {
                        // Check for inline image data
                        if (part.inlineData?.mimeType?.startsWith('image/')) {
                            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`)
                        }
                    }
                }

                if (images.length > 0) {
                    // Deduct credits on success (5 credits per image)
                    await deductCredits(session.user.id, 5, `Generated image with ${modelName}`, {
                        model: modelName
                    })

                    return NextResponse.json({
                        success: true,
                        images,
                        model: modelName,
                        count: images.length
                    })
                }

                // If no images but text response (for non-image-output models)
                const textResponse = candidates[0]?.content?.parts?.[0]?.text
                if (textResponse && modelName !== 'gemini-2.0-flash-exp') {
                    // Models without image output return text - use this as description
                    return NextResponse.json({
                        success: false,
                        error: 'Image generation not available',
                        message: `Image generation requires a paid API plan or the gemini-2.0-flash-exp model with available quota. Your prompt would create: ${textResponse.substring(0, 300)}...`,
                        textResponse: textResponse,
                        model: modelName
                    }, { status: 200 })
                }

            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error'
                console.error(`Exception with ${modelName}:`, message)
                lastError = message
                continue
            }
        }

        // All models failed
        return NextResponse.json({
            success: false,
            error: 'Image generation failed',
            message: lastError || 'All image generation attempts failed. Please try again later.',
            suggestion: 'Your Gemini API quota may be exceeded. Wait a minute and try again, or upgrade your API plan.'
        }, { status: 429 })

    } catch (error: unknown) {
        console.error('Image generation error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error occurred'
        return NextResponse.json(
            {
                error: 'Failed to generate image',
                message
            },
            { status: 500 }
        )
    }
}
