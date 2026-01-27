import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import { AIModel, AIModelApiKey } from '@/lib/mongodb/models'
import { encryptApiKey } from '@/lib/ai-encryption'

// GET - Fetch all AI models or only active ones
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('active') === 'true'

        await dbConnect()

        const query = activeOnly ? { isActive: true } : {}
        const models = await AIModel.find(query)
            .sort({ displayOrder: 1 })
            .lean()

        return NextResponse.json({
            models: models.map(m => ({
                ...m,
                id: m._id.toString(),
                _id: undefined
            }))
        })
    } catch (error) {
        console.error('Error fetching AI models:', error)
        return NextResponse.json(
            { error: 'Failed to fetch AI models' },
            { status: 500 }
        )
    }
}

// POST - Create a new AI model
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            provider,
            model_name,
            display_name,
            description,
            api_endpoint,
            model_id,
            supports_streaming,
            supports_functions,
            supports_vision,
            default_temperature,
            default_max_tokens,
            default_top_p,
            price_per_1k_input,
            price_per_1k_output,
            currency,
            is_active,
            display_order,
            api_key
        } = body

        await dbConnect()

        // Insert model
        const model = await AIModel.create({
            provider,
            modelName: model_name,
            displayName: display_name,
            description,
            apiEndpoint: api_endpoint,
            modelId: model_id,
            supportsStreaming: supports_streaming ?? true,
            supportsFunctions: supports_functions ?? false,
            supportsVision: supports_vision ?? false,
            defaultTemperature: default_temperature ?? 0.7,
            defaultMaxTokens: default_max_tokens ?? 2000,
            defaultTopP: default_top_p ?? 1.0,
            pricePer1kInput: price_per_1k_input,
            pricePer1kOutput: price_per_1k_output,
            currency: currency || 'USD',
            isActive: is_active ?? false,
            displayOrder: display_order ?? 0,
            connectionStatus: 'not_tested'
        })

        // If API key is provided, encrypt and store it
        if (api_key && api_key.trim()) {
            const { encryptedKey, iv } = encryptApiKey(api_key)

            await AIModelApiKey.findOneAndUpdate(
                { provider },
                {
                    provider,
                    encryptedApiKey: encryptedKey,
                    encryptionIv: iv,
                },
                { upsert: true, new: true }
            )
        }

        return NextResponse.json({
            model: {
                ...model.toObject(),
                id: model._id.toString(),
                _id: undefined
            }
        })
    } catch (error) {
        console.error('Error creating AI model:', error)
        return NextResponse.json(
            { error: 'Failed to create AI model' },
            { status: 500 }
        )
    }
}

// PUT - Update an existing AI model
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, api_key, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
        }

        await dbConnect()

        // Map snake_case to camelCase for update
        const mappedUpdateData: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(updateData)) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
            mappedUpdateData[camelKey] = value
        }

        // Update model
        const model = await AIModel.findByIdAndUpdate(
            id,
            mappedUpdateData,
            { new: true }
        )

        if (!model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        // If API key is provided, update it
        if (api_key && api_key.trim()) {
            const { encryptedKey, iv } = encryptApiKey(api_key)

            await AIModelApiKey.findOneAndUpdate(
                { provider: model.provider },
                {
                    provider: model.provider,
                    encryptedApiKey: encryptedKey,
                    encryptionIv: iv,
                },
                { upsert: true, new: true }
            )
        }

        return NextResponse.json({
            model: {
                ...model.toObject(),
                id: model._id.toString(),
                _id: undefined
            }
        })
    } catch (error) {
        console.error('Error updating AI model:', error)
        return NextResponse.json(
            { error: 'Failed to update AI model' },
            { status: 500 }
        )
    }
}

// DELETE - Remove an AI model
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
        }

        await dbConnect()

        const result = await AIModel.findByIdAndDelete(id)

        if (!result) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting AI model:', error)
        return NextResponse.json(
            { error: 'Failed to delete AI model' },
            { status: 500 }
        )
    }
}
