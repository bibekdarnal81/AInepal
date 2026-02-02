
import dbConnect from './lib/mongodb/client'
import { AIModel } from './lib/mongodb/models'

async function checkModels() {
    await dbConnect()
    const models = await AIModel.find({
        isActive: true,
        disabled: { $ne: true },
        availableInVSCode: true
    }).select('modelId displayName').lean()

    console.log('VS Code Models:', models)
    process.exit(0)
}

checkModels().catch(console.error)
