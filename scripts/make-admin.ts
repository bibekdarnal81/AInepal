
import dbConnect from '@/lib/mongodb/client'
import { User } from '@/lib/mongodb/models'
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string) => new Promise<string>((resolve) => rl.question(query, resolve));

async function createOrUpdateAdmin() {
    try {
        await dbConnect()
        console.log('Connected to DB')

        const email = await question('Enter email to make admin: ');

        if (!email) {
            console.error('Email is required')
            process.exit(1)
        }

        const user = await User.findOne({ email: email.toLowerCase() })

        if (user) {
            user.isAdmin = true;
            await user.save();
            console.log(`User ${email} is now an ADMIN.`)
        } else {
            console.log(`User ${email} not found. checking if you want to create one...`)
            // For now, just tell them to register first or I could implement creation here.
            // But usually it's better to promote an existing user to avoid password hashing complexity in a simple script unless needed.
            // Let's just promote for now as they likely just registered.
            console.error(`User with email ${email} does not exist. Please register via the app first, then run this script again.`)
        }

    } catch (error) {
        console.error('Error:', error)
    } finally {
        rl.close();
        process.exit()
    }
}

createOrUpdateAdmin()
