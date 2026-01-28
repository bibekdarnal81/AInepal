import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugOpenAIDefault() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', new mongoose.Schema({}, { strict: false }));

        // 1. Check for exactly 'openai-default'
        const badModel = await AIModel.findOne({ modelId: 'openai-default' });
        if (badModel) {
            console.log('\n[CRITICAL] Found model with modelId="openai-default":');
            console.log(`  _id: ${badModel._id}`);
            console.log(`  displayName: ${badModel.displayName}`);
            console.log(`  provider: ${badModel.provider}`);
            console.log(`  isActive: ${badModel.isActive}`);
        } else {
            console.log('\n[INFO] No model found with modelId="openai-default"');
        }

        // 2. Check for any model that lists 'openai-default' as its name?
        // Maybe modelName?
        const badName = await AIModel.findOne({ modelName: 'openai-default' });
        if (badName && (!badModel || badName._id.toString() !== badModel._id.toString())) {
            console.log('\n[CRITICAL] Found model with modelName="openai-default":');
            console.log(badName);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

debugOpenAIDefault();
