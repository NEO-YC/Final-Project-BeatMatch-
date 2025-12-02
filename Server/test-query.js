// Test query to find active musicians
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/UserModel');

async function testQuery() {
    try {
        const uri = "mongodb+srv://david:Aa123456@cluster0.v1bla6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
        await mongoose.connect(uri, clientOptions);
        console.log('✅ Connected to MongoDB\n');

        // Test different queries
        console.log('=== Test 1: All musicians ===');
        const allMusicians = await User.find({ isMusician: true }).select('firstname lastname');
        console.log(`Found ${allMusicians.length} musicians total`);
        
        console.log('\n=== Test 2: With dot notation ===');
        const dotNotation = await User.find({ 
            isMusician: true,
            'musicianProfile.isActive': true 
        }).select('firstname lastname musicianProfile.isActive');
        console.log(`Found ${dotNotation.length} musicians with dot notation`);
        if (dotNotation.length > 0) {
            dotNotation.forEach(m => {
                console.log(`- ${m.firstname} ${m.lastname}, isActive: ${m.musicianProfile[0]?.isActive}`);
            });
        }

        console.log('\n=== Test 3: With $elemMatch ===');
        const elemMatch = await User.find({ 
            isMusician: true,
            musicianProfile: { $elemMatch: { isActive: true } }
        }).select('firstname lastname musicianProfile.isActive');
        console.log(`Found ${elemMatch.length} musicians with $elemMatch`);
        if (elemMatch.length > 0) {
            elemMatch.forEach(m => {
                console.log(`- ${m.firstname} ${m.lastname}, isActive: ${m.musicianProfile[0]?.isActive}`);
            });
        }

        console.log('\n=== Test 4: Check all profiles ===');
        const all = await User.find({ isMusician: true }).limit(3);
        all.forEach(m => {
            console.log(`\n${m.firstname} ${m.lastname}:`);
            console.log(`  - Has profile: ${m.musicianProfile && m.musicianProfile.length > 0}`);
            if (m.musicianProfile && m.musicianProfile[0]) {
                console.log(`  - isActive: ${m.musicianProfile[0].isActive}`);
                console.log(`  - isActive type: ${typeof m.musicianProfile[0].isActive}`);
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testQuery();
