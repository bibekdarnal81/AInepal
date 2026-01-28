import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function disableAllVSCodeModels() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', new mongoose.Schema({}, { strict: false }));

        console.log('Updating all models to set availableInVSCode = false...');

        const result = await AIModel.updateMany(
            {},
            { $set: { availableInVSCode: false } }
        );

        console.log(`Update Complete.`);
        console.log(`Matched: ${result.matchedCount}`);
        console.log(`Modified: ${result.modifiedCount}`);

    } catch (error) {
        console.error('Update failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

disableAllVSCodeModels();
