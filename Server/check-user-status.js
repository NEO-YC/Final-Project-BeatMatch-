// Check current user's profile status
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/UserModel');

async function checkUser() {
    try {
        const uri = "mongodb+srv://david:Aa123456@cluster0.v1bla6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
        await mongoose.connect(uri, clientOptions);
        console.log('✅ Connected to MongoDB\n');

        // מצא את כל המוזיקאים
        const musicians = await User.find({ isMusician: true }).select('firstname lastname email musicianProfile.isActive');
        
        console.log('=== All Musicians ===\n');
        musicians.forEach(m => {
            const profile = m.musicianProfile && m.musicianProfile[0];
            console.log(`${m.firstname} ${m.lastname} (${m.email})`);
            console.log(`  isActive: ${profile ? profile.isActive : 'NO PROFILE'}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkUser();
