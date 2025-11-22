const User = require('../Models/UserModel');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');



exports.register = async function (req, res) {
    try {
        const { firstname, lastname, email, password, birthday, phone} = req.body;
      
        
        // בדיקת תקינות הנתונים
        if (!firstname || !lastname || !email || !password || !birthday) {
            return res.status(400).json({ 
                "message": "כל השדות נדרשים: firstname, lastname, email, password, birthday" 
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
        const jwtSecret = process.env.JWT_SECRET || 'secret-key-change-in-production';
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
        const { musictype, location, instrument } = req.query;

        // בניית query בסיסי - רק מוזיקאים
        let query = { isMusician: true };

        // הוספת תנאי חיפוש לפי סוג מוזיקה
        if (musictype) {
            query['musicianProfile.musictype'] = new RegExp(musictype, 'i');
        }
        
        // הוספת תנאי חיפוש לפי כלי נגינה
        if (instrument) {
            query['musicianProfile.instrument'] = new RegExp(instrument, 'i');
        }
        
        // הוספת תנאי חיפוש לפי מיקום
        if (location) {
            query['musicianProfile.location'] = new RegExp(location, 'i');
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

