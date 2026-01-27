
import dotenv from 'dotenv';
import path from 'path';

// Load env before importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import crypto from 'crypto';

async function verifyAuth() {
    try {
        // Dynamic imports to ensure env is loaded first
        const { default: dbConnect } = await import('@/lib/mongodb/client');
        const { User, UserApiKey } = await import('@/lib/mongodb/models');

        console.log('Connecting to DB...');
        await dbConnect();

        // 1. Find or create a test user
        let user = await User.findOne({ email: 'test-vscode-auth@example.com' });
        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                email: 'test-vscode-auth@example.com',
                displayName: 'Test VSCode User',
                isAdmin: false,
                isSuspended: false,
                credits: 100,
                advancedCredits: 100
            });
        }

        console.log(`User ID: ${user._id}`);

        // 2. Create a test API key
        const randomBytes = crypto.randomBytes(16).toString('hex');
        const testKey = `sk_vscode_test_${randomBytes}`;

        // Clean up old test keys
        await UserApiKey.deleteMany({ name: 'Test Verify Script' });

        await UserApiKey.create({
            userId: user._id,
            name: 'Test Verify Script',
            key: testKey,
            lastUsedAt: new Date()
        });

        console.log(`Created Test Key: ${testKey}`);

        // 3. Test the API
        console.log('Sending POST request to /api/vscode/chat...');
        const response = await fetch('http://localhost:3000/api/vscode/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${testKey}`
            },
            body: JSON.stringify({
                prompt: 'Hello, verify auth',
                modelId: 'default',
                fileName: 'test.ts'
            })
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (response.status === 200) {
            console.log('✅ Auth Verification SUCCESS');
        } else {
            console.log('❌ Auth Verification FAILED');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
}

verifyAuth();
