import dbConnect from '../lib/mongodb/client';
import { User } from '../lib/mongodb/models';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const makeAdmin = async () => {
    try {
        await dbConnect();

        rl.question('Enter email of user to make admin: ', async (email) => {
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                console.error(`User found with email: ${email}`);
                process.exit(1);
            }

            user.isAdmin = true;
            await user.save();

            console.log(`Successfully made ${email} an admin!`);
            process.exit(0);
        });

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

makeAdmin();
