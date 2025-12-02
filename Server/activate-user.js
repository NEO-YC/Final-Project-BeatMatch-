// Manually activate a user (for testing only)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/UserModel');

async function activateUser(email) {
    try {
        const uri = "mongodb+srv://david:Aa123456@cluster0.v1bla6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
        await mongoose.connect(uri, clientOptions);
        console.log('✅ Connected to MongoDB\n');

        const user = await User.findOne({ email: email });
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        if (!user.musicianProfile || user.musicianProfile.length === 0) {
            console.log('❌ User has no musician profile');
            return;
        }

        const profile = user.musicianProfile[0];
        console.log(`Found: ${user.firstname} ${user.lastname}`);
        console.log(`Current isActive: ${profile.isActive}`);

        // הפעל את הפרופיל
        profile.isActive = true;

        await user.save();
        console.log('\n✅ User activated successfully!');
        console.log(`New isActive: ${profile.isActive}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// עדכן את האימייל כאן
const userEmail = process.argv[2] || 'fullstack3@gmail.com';
activateUser(userEmail);
