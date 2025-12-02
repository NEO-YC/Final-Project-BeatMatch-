
const express = require('express');
const router = express.Router();



//distructure the controller functions: 
const { 
    register, 
    login,
    updateMusicianProfile,
    uploadToCloudinary,
    getUploadSignature,
    updateAvailability,
    getMusicianProfile,
    searchMusicians,
    createPayPalOrder,
    capturePayPalOrder,
    handlePayPalWebhook,
    deleteUser
} = require('../Controllers/UserController');



// distructure the authentication middleware
const { authenticateToken } = require('../Middlewear/Middlewear');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });



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
// Get Cloudinary upload signature
router.get('/upload-signature', authenticateToken, getUploadSignature);
// upload single file to Cloudinary 
router.post('/upload', authenticateToken, upload.single('file'), uploadToCloudinary);

// PayPal payment flow
router.post('/payments/create', authenticateToken, createPayPalOrder);
router.post('/payments/capture', authenticateToken, capturePayPalOrder);
// Webhook (public)
router.post('/payments/webhook', express.json({ type: '*/*' }), handlePayPalWebhook);

// קבלת הפרופיל שלי (המשתמש המחובר)
router.get('/me/musician-profile', authenticateToken, getMusicianProfile);
// מחיקת חשבון משתמש )
router.delete('/account', authenticateToken, deleteUser);






module.exports = router; 
