
const express = require('express');
const router = express.Router();



//distructure the controller functions: 
const { 
    register, 
    login,
    updateMusicianProfile,
    updateAvailability,
    getMusicianProfile,
    searchMusicians
} = require('../Controllers/UserController');



// distructure the authentication middleware
const { authenticateToken } = require('../Middlewear/Middlewear');



// נתיבים פומביים (ללא אימות)
router.post('/register', register);
router.post('/login', login);

// חיפוש מוזיקאים - פומבי
router.get('/musicians/search', searchMusicians);

// צפייה בפרופיל מוזיקאי - פומבי
router.get('/musicians/:userId', getMusicianProfile);




// נתיבים מאובטחים (דורשים אימות JWT)
router.put('/musician/profile', authenticateToken, updateMusicianProfile);
router.put('/musician/availability', authenticateToken, updateAvailability);

// קבלת הפרופיל שלי (המשתמש המחובר)
router.get('/me/musician-profile', authenticateToken, getMusicianProfile);






module.exports = router; 
