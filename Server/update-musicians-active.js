// Script to update existing musicians with isActive field
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/UserModel');

async function updateMusicians() {
    try {
        // Connect to MongoDB - השתמש באותו URI כמו בשרת הראשי
        const uri = process.env.MONGODB_URI;
        const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
        await mongoose.connect(uri, clientOptions);
        console.log('✅ Connected to MongoDB');

        // Find all musicians
        const musicians = await User.find({ isMusician: true });
        console.log(`Found ${musicians.length} musicians`);

        let updated = 0;
        for (const musician of musicians) {
            if (musician.musicianProfile && musician.musicianProfile.length > 0) {
                const profile = musician.musicianProfile[0];
                
                // אם אין שדה isActive, הוסף אותו
                if (profile.isActive === undefined) {
                    // ברירת מחדל - לא פעיל
                    profile.isActive = false;
                    
                    await musician.save();
                    updated++;
                    console.log(`Updated ${musician.firstname} ${musician.lastname} - isActive: ${profile.isActive}`);
                }
            }
        }

        console.log(`\n✅ Updated ${updated} musicians`);
        
        // לבדיקה: הצג כמה מוזיקאים פעילים
        const activeCount = await User.countDocuments({ 
            isMusician: true,
            'musicianProfile.isActive': true 
        });
        console.log(`Active musicians: ${activeCount}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateMusicians();
