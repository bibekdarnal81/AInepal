import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkVSCodeStatus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', new mongoose.Schema({}, { strict: false }));

        const models = await AIModel.find({});

        console.log('\n--- Model VS Code Status ---');
        let availableCount = 0;

        models.forEach(model => {
            const isAvailable = model.availableInVSCode;
            if (isAvailable) availableCount++;

            console.log(`[${model.displayName}]`);
            console.log(`  ID: ${model._id}`);
            console.log(`  AvailableInVSCode: ${isAvailable}`);
            console.log(`  Type of field: ${typeof isAvailable}`);
            console.log('---');
        });

        console.log(`\nTotal Models: ${models.length}`);
        console.log(`Total Available in VS Code: ${availableCount}`);

        if (availableCount === 0) {
            console.log('\n⚠️ NO MODELS are marked available for VS Code!');
            console.log('You likely need to run a migration to set the default value for existing documents.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkVSCodeStatus();
