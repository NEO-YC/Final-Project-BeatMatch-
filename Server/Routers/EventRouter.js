const express = require('express');
const router = express.Router();

// ייבוא הפונקציות מה-Controller
const { 
  createEvent, 
  getAllEvents, 
  getOpenEventsCount, 
  closeEvent 
} = require('../Controllers/EventController');

// ייבוא ה-Middleware לאימות (רק לניתובים שדורשים התחברות)
const { authenticateToken } = require('../Middlewear/Middlewear');

// === ניתובים ===

// יצירת אירוע חדש - פתוח לכולם (ללא אימות)
router.post('/create', createEvent);

// קבלת כל האירועים הפתוחים - רק למוזיקאים פעילים
router.get('/all', authenticateToken, getAllEvents);

// ספירת אירועים פתוחים - למוזיקאים פעילים (לאינדיקטור)
router.get('/count', authenticateToken, getOpenEventsCount);

// סגירת אירוע - רק למוזיקאים רשומים
router.put('/:eventId/close', authenticateToken, closeEvent);

module.exports = router;
