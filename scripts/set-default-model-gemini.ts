import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setDefaultModel() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const AIModelSchema = new mongoose.Schema({}, { strict: false });
        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', AIModelSchema);

        // 1. Find Gemini 2.0 Flash
        // In the previous check-models output, the model ID was 'gemini-2.0-flash-exp' and display name 'Gemini 2.0 Flash'
        // Let's search by modelId or displayName
        const targetModel = await AIModel.findOne({
            $or: [
                { modelId: 'gemini-2.0-flash-exp' },
                { displayName: 'Gemini 2.0 Flash' }
            ]
        });

        if (!targetModel) {
            console.error('Target model "Gemini 2.0 Flash" not found!');
            return;
        }

        console.log(`Found target model: ${targetModel.displayName} (${targetModel._id})`);

        // 2. Shift all other models' displayOrder by 1 to make room
        await AIModel.updateMany(
            { _id: { $ne: targetModel._id } },
            { $inc: { displayOrder: 1 } }
        );

        // 3. Set target model to 0
        targetModel.displayOrder = 0;
        await AIModel.updateOne({ _id: targetModel._id }, { $set: { displayOrder: 0 } });

        console.log('Successfully updated display orders.');
        console.log(`${targetModel.displayName} is now the default model.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

setDefaultModel();
