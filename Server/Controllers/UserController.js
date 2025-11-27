const User = require('../Models/UserModel');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// configure cloudinary using env vars (values kept in Server/.env locally)
console.log('🔧 Cloudinary Config Debug:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret length:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0);
console.log('API Secret (first 5 chars):', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.substring(0, 5) : 'MISSING');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
});



exports.register = async function (req, res) {
    try {
        const { firstname, lastname, email, password, birthday, phone} = req.body;
         
        
        // בדיקת תקינות הנתונים
        if (!firstname || !lastname || !email || !password || !birthday) {
            // החזרת הודעה ידידותית למשתמש בעברית
            return res.status(400).json({ 
                "message": "אנא מלא/י את כל השדות המסומנים בכוכבית (שם פרטי, שם משפחה, אימייל, סיסמה ותאריך לידה)"
            });
        }

        
        
        
        // בדיקת חוזק הסיסמה (לפחות 6 תווים)
        if (password.length < 6) {
            return res.status(400).json({ 
                "message": "הסיסמה חייבת להכיל לפחות 6 תווים" 
            });
        }




        
        // הצפנת הסיסמה
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);



        // יצירת משתמש חדש עם הסיסמה המוצפנת
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            birthday: new Date(birthday),
            phone: phone || null
        });
        
        const savedUser = await newUser.save();



        
        // מחזירים את המשתמש ללא הסיסמה
        const userResponse = {
            _id: savedUser._id,
            firstname: savedUser.firstname,
            lastname: savedUser.lastname,
            email: savedUser.email,
            birthday: savedUser.birthday,
            phone: savedUser.phone,
            isMusician: savedUser.isMusician,
            musicianProfile: savedUser.musicianProfile,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
        };
        
        res.status(201).json(userResponse);
        
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ "message": "האימייל כבר קיים במערכת" });
        } else {
            res.status(500).json({ "message": "שגיאה ברישום המשתמש", "error": error.message });
        }
    }
};
















exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        
        // בדיקת תקינות הנתונים
        if (!email || !password) {
            return res.status(400).json({ 
                "message": "אימייל וסיסמה נדרשים" 
            });
        }



        
        
        // חיפוש המשתמש לפי אימייל
        const user = await User.findOne({ email: email }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                "message": "אימייל או סיסמה שגויים" 
            });
        }
        
        // השוואת הסיסמה עם הסיסמה המוצפנת
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                "message": "אימייל או סיסמה שגויים" 
            });
        }
        
    


         // יצירת JWT token
        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email 
            },
            jwtSecret,
            { 
                expiresIn: '24h' // התוקף של הטוקן - 24 שעות
            }


            
        );
        
        // אם הכל תקין, מחזירים את פרטי המשתמש (ללא סיסמה) ואת הטוקן
        const userResponse = {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            birthday: user.birthday,
            phone: user.phone || null,
            isMusician: user.isMusician,
            musicianProfile: user.musicianProfile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(200).json({
            "message": "התחברות הצליחה",
            "user": userResponse,
            "token": token
        });
        




    } catch (error) {
        res.status(500).json({ "message": "שגיאה בהתחברות", "error": error.message });
    }
};














// עדכון או יצירת פרופיל מוזיקאי
exports.updateMusicianProfile = async function (req, res) {
    try {
        const userId = req.userId; // מגיע מה-middleware של אימות
        const { 
            instrument, 
            musictype, 
            experienceYears, 
            profilePicture,
            eventTypes,
            bio,
            location,
            galleryPictures,
            galleryVideos
        } = req.body;

        // מציאת המשתמש
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ "message": "משתמש לא נמצא" });
        }

        // עדכון או יצירת פרופיל מוזיקאי
        if (user.musicianProfile.length === 0) {
            // יצירת פרופיל חדש
            user.musicianProfile.push({
                instrument,
                musictype,
                experienceYears,
                profilePicture,
                eventTypes: eventTypes || [],
                bio,
                location: location || [],
                galleryPictures: galleryPictures || [],
                galleryVideos: galleryVideos || [],
                availability: []
            });
        } else {
            // עדכון פרופיל קיים
            const profile = user.musicianProfile[0];
            if (instrument !== undefined) profile.instrument = instrument;
            if (musictype !== undefined) profile.musictype = musictype;
            if (experienceYears !== undefined) profile.experienceYears = experienceYears;
            if (profilePicture !== undefined) profile.profilePicture = profilePicture;
            if (eventTypes !== undefined) profile.eventTypes = eventTypes;
            if (bio !== undefined) profile.bio = bio;
            if (location !== undefined) profile.location = location;
            if (galleryPictures !== undefined) profile.galleryPictures = galleryPictures;
            if (galleryVideos !== undefined) profile.galleryVideos = galleryVideos;
        }

        // סימון שהמשתמש הוא מוזיקאי
        user.isMusician = true;

        await user.save();

        res.status(200).json({
            "message": "פרופיל מוזיקאי עודכן בהצלחה",
            "musicianProfile": user.musicianProfile[0]
        });

    } catch (error) {
        res.status(500).json({ 
            "message": "שגיאה בעדכון פרופיל מוזיקאי", 
            "error": error.message 
        });
    }
};

// Get Cloudinary signature for client-side upload
exports.getUploadSignature = async function (req, res) {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return res.status(500).json({ message: 'Cloudinary not configured' });
        }

        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'final-project';
        
        // Create params for signature - ONLY these params, nothing more
        const paramsToSign = {
            timestamp: timestamp,
            folder: folder
        };

        // Generate signature using Cloudinary's method
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        console.log('✍️ Generated signature:', { timestamp, folder, signature: signature.substring(0, 10) + '...' });

        res.status(200).json({
            timestamp,
            signature,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            folder
        });
    } catch (error) {
        console.error('Signature generation error:', error);
        res.status(500).json({ message: 'Failed to generate signature', error: error.message });
    }
};

// Upload a single file (from multer memoryStorage) to Cloudinary OR save already-uploaded URL
exports.uploadToCloudinary = async function (req, res) {
    try {
        // Check if this is a save-URL request (client already uploaded to Cloudinary)
        if (req.body && req.body.url && req.body.save) {
            const { url, public_id, save: saveHint } = req.body;
            
            let persistedProfile = null;
            if (saveHint && req.userId) {
                try {
                    const user = await User.findById(req.userId);
                    if (user) {
                        if (!Array.isArray(user.musicianProfile)) user.musicianProfile = [];
                        if (user.musicianProfile.length === 0) {
                            user.musicianProfile.push({ profilePicture: '', galleryPictures: [], galleryVideos: [], availability: [] });
                        }
                        const profile = user.musicianProfile[0];
                        if (saveHint === 'profile') {
                            profile.profilePicture = url;
                        } else if (saveHint === 'gallery') {
                            if (!Array.isArray(profile.galleryPictures)) profile.galleryPictures = [];
                            profile.galleryPictures.push(url);
                        }
                        await user.save();
                        persistedProfile = user.musicianProfile[0];
                        console.log('✅ Saved URL to profile:', { saveHint, url: url.substring(0, 50) });
                    }
                } catch (errSave) {
                    console.error('Failed to persist URL:', errSave);
                }
            }
            
            const responsePayload = { url, public_id };
            if (persistedProfile) responsePayload.musicianProfile = persistedProfile;
            return res.status(200).json(responsePayload);
        }
        
        // Original upload flow (if file buffer present)
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Check Cloudinary credentials early and return a helpful error
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary env vars missing');
            return res.status(500).json({ message: 'Cloudinary not configured on server. Please set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env' });
        }
        
        console.log('📤 Starting upload to Cloudinary...');
        console.log('File mimetype:', req.file.mimetype);
        console.log('File size:', req.file.size);
        
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'final-project', 
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary upload error:', error);
                        return reject(error);
                    }
                    console.log('✅ Upload successful:', result.secure_url);
                    resolve(result);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        // If the client sent a "save" hint (FormData field), persist the URL into the user's musicianProfile
        const saveHint = (req.body && req.body.save) || (req.query && req.query.save) || null;
        let persistedProfile = null;
        if (saveHint && req.userId) {
            try {
                const user = await User.findById(req.userId);
                if (user) {
                    if (!Array.isArray(user.musicianProfile)) user.musicianProfile = [];
                    if (user.musicianProfile.length === 0) {
                        user.musicianProfile.push({ profilePicture: '', galleryPictures: [], galleryVideos: [], availability: [] });
                    }
                    const profile = user.musicianProfile[0];
                    if (saveHint === 'profile') {
                        profile.profilePicture = result.secure_url;
                    } else if (saveHint === 'gallery') {
                        if (!Array.isArray(profile.galleryPictures)) profile.galleryPictures = [];
                        profile.galleryPictures.push(result.secure_url);
                    }
                    await user.save();
                    persistedProfile = user.musicianProfile[0];
                }
            } catch (errSave) {
                console.error('Failed to persist uploaded URL to user profile:', errSave);
            }
        }

        const responsePayload = { url: result.secure_url, public_id: result.public_id };
        if (persistedProfile) responsePayload.musicianProfile = persistedProfile;

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'שגיאה בהעלאת קובץ', error: error.message });
    }
};
















// עדכון זמינות של מוזיקאי
exports.updateAvailability = async function (req, res) {
    try {
        const userId = req.userId; // מגיע מה-middleware של אימות
        const { availability } = req.body; // מערך של אובייקטים: [{from, to, day}, ...]

        // בדיקת תקינות הנתונים
        if (!Array.isArray(availability)) {
            return res.status(400).json({ 
                "message": "availability חייב להיות מערך" 
            });
        }

        // מציאת המשתמש
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ "message": "משתמש לא נמצא" });
        }

        // וידוא שיש פרופיל מוזיקאי
        if (user.musicianProfile.length === 0) {
            return res.status(400).json({ 
                "message": "יש ליצור פרופיל מוזיקאי קודם" 
            });
        }

        // עדכון הזמינות
        user.musicianProfile[0].availability = availability.map(slot => ({
            userId: userId,
            from: slot.from,
            to: slot.to,
            day: slot.day
        }));

        await user.save();

        res.status(200).json({
            "message": "זמינות עודכנה בהצלחה",
            "availability": user.musicianProfile[0].availability
        });

    } catch (error) {
        res.status(500).json({ 
            "message": "שגיאה בעדכון זמינות", 
            "error": error.message 
        });
    }
};
















// קבלת פרופיל מוזיקאי לפי ID
exports.getMusicianProfile = async function (req, res) {
    try {
        const userId = req.params.userId || req.userId;

        // מציאת המשתמש
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ "message": "משתמש לא נמצא" });
        }

        // בדיקה שהמשתמש הוא מוזיקאי ויש לו פרופיל
        if (!user.isMusician || user.musicianProfile.length === 0) {
            return res.status(404).json({ 
                "message": "משתמש זה אינו מוזיקאי או אין לו פרופיל" 
            });
        }

        res.status(200).json({
            "user": {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            },
            "musicianProfile": user.musicianProfile[0]
        });

    } catch (error) {
        res.status(500).json({ 
            "message": "שגיאה בטעינת פרופיל", 
            "error": error.message 
        });
    }
};
















// חיפוש מוזיקאים לפי קריטריונים
exports.searchMusicians = async function (req, res) {
    try {
        // פרמטרים יכולים להגיע כ-array (repeated params) או כמחרוזת מופרדת בפסיקים
        const { musictype, location, instrument, eventTypes, region } = req.query;

        // בניית query בסיסי - רק מוזיקאים
        let query = { isMusician: true };

        // עזר להמיר לפרמטרים רלוונטיים (array of strings)
        const toArray = (v) => {א
            if (!v) return [];
            if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
            return String(v).split(',').map(x => x.trim()).filter(Boolean);
        };

        // סוגי מוזיקה
        const types = toArray(musictype);
        if (types.length) {
            query['musicianProfile.musictype'] = { $in: types.map(t => new RegExp(t, 'i')) };
        }

        // כלי נגינה
        const instruments = toArray(instrument);
        if (instruments.length) {
            query['musicianProfile.instrument'] = { $in: instruments.map(i => new RegExp(i, 'i')) };
        }

        // סוגי אירועים
        const events = toArray(eventTypes);
        if (events.length) {
            query['musicianProfile.eventTypes'] = { $in: events.map(e => new RegExp(e, 'i')) };
        }

        // אזור/מיקום: אם נשלח region נשתמש בו, אחרת נתמוך ב-location חופשי
        if (region) {
            query['musicianProfile.region'] = new RegExp(String(region).trim(), 'i');
        } else if (location) {
            query['musicianProfile.location'] = new RegExp(String(location).trim(), 'i');
        }

        // ביצוע החיפוש ללא החזרת סיסמאות
        const musicians = await User.find(query).select('-password');

        res.status(200).json({
            "count": musicians.length,
            "musicians": musicians.map(m => ({
                _id: m._id,
                firstname: m.firstname,
                lastname: m.lastname,
                musicianProfile: m.musicianProfile[0]
            }))
        });

    } catch (error) {
        res.status(500).json({ 
            "message": "שגיאה בחיפוש מוזיקאים", 
            "error": error.message 
        });
    }
};

