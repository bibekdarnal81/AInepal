#!/usr/bin/env node

/**
 * R2 Configuration Checker
 * Run this to verify your R2 credentials are properly set
 */

const run = async () => {
    const fs = await import('fs');
    const path = await import('path');

    const envPath = path.join(process.cwd(), '.env.local');

    console.log('🔍 Checking R2 Configuration...\n');

    if (!fs.existsSync(envPath)) {
        console.log('❌ .env.local file not found!\n');
        console.log('📋 Create a .env.local file with your R2 credentials:');
        console.log(`
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-here
R2_SECRET_ACCESS_KEY=your-secret-key-here
R2_BUCKET_NAME=company
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
    `);
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};

    // Parse .env.local file
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    const requiredVars = [
        'R2_ENDPOINT',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_BUCKET_NAME',
        'R2_PUBLIC_URL'
    ];

    let allPresent = true;
    const configStatus = {};

    requiredVars.forEach(varName => {
        const value = envVars[varName];
        const isPresent = !!value && value.length > 0;

        configStatus[varName] = {
            present: isPresent,
            preview: isPresent ? `${value.substring(0, 30)}...` : '❌ MISSING'
        };

        if (!isPresent) {
            allPresent = false;
        }
    });

    // Print results
    console.log('Environment Variables Status:\n');
    Object.entries(configStatus).forEach(([key, status]) => {
        const icon = status.present ? '✅' : '❌';
        console.log(`${icon} ${key}: ${status.preview}`);
    });

    console.log('\n');

    if (allPresent) {
        console.log('✅ All R2 credentials are configured!\n');
        console.log('📝 Configuration Summary:');
        console.log(`   Endpoint: ${envVars.R2_ENDPOINT}`);
        console.log(`   Bucket: ${envVars.R2_BUCKET_NAME}`);
        console.log(`   Public URL: ${envVars.R2_PUBLIC_URL}`);
        console.log(`   Access Key: ${envVars.R2_ACCESS_KEY_ID.substring(0, 12)}...`);
        console.log('\n⚠️  If you\'re still getting "AWS Access Key" errors:');
        console.log('   1. Your Access Key ID or Secret Key might be incorrect');
        console.log('   2. Go to Cloudflare Dashboard > R2 > Manage R2 API Tokens');
        console.log('   3. Verify or create a new API token');
        console.log('   4. Update .env.local with the new credentials');
        console.log('   5. Restart your dev server (Ctrl+C, then npm run dev)\n');
    } else {
        console.log('❌ Missing R2 credentials!\n');
        console.log('📋 To fix this:');
        console.log('1. Go to https://dash.cloudflare.com');
        console.log('2. Navigate to R2 > Manage R2 API Tokens');
        console.log('3. Create a new API token with "Object Read & Write" permissions');
        console.log('4. Copy the credentials to your .env.local file');
        console.log('5. Restart your dev server\n');
    }

    console.log('💡 Need help? Check R2_SETUP.md for detailed instructions.\n');
};

run();
