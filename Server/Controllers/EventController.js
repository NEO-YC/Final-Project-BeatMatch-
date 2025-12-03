const Event = require('../Models/EventModel');
const User = require('../Models/UserModel');

// יצירת אירוע חדש - פתוח לכולם (גם לא רשומים)
const createEvent = async (req, res) => {
  try {
    const { 
      contactName, 
      contactPhone, 
      contactEmail, 
      eventType, 
      eventDate, 
      location, 
      budgetMin, 
      budgetMax, 
      description 
    } = req.body;

    // וולידציה בסיסית
    if (!contactName || !contactPhone || !eventType || !eventDate || !location || !description) {
      return res.status(400).json({ 
        message: 'חסרים שדות חובה' 
      });
    }

    // יצירת האירוע
    const newEvent = new Event({
      contactName,
      contactPhone,
      contactEmail,
      eventType,
      eventDate,
      location,
      budgetMin,
      budgetMax,
      description,
      status: 'פתוח'
    });

    await newEvent.save();

    res.status(201).json({ 
      message: 'האירוע פורסם בהצלחה!',
      event: newEvent 
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      message: 'שגיאה ביצירת האירוע',
      error: error.message 
    });
  }
};

// קבלת כל האירועים הפתוחים - רק למוזיקאים פעילים
const getAllEvents = async (req, res) => {
  try {
    // בדיקה שהמשתמש מחובר
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        message: 'נדרשת התחברות' 
      });
    }

    // בדיקה שהמשתמש הוא מוזיקאי פעיל
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'משתמש לא נמצא' 
      });
    }

    // בדיקה אם יש פרופיל מוזיקאי פעיל
    const hasActiveProfile = user.musicianProfile && 
                            user.musicianProfile.length > 0 && 
                            user.musicianProfile[0].isActive === true;

    if (!hasActiveProfile) {
      return res.status(403).json({ 
        message: 'גישה למוזיקאים פעילים בלבד',
        needsPayment: true 
      });
    }

    // שליפת כל האירועים הפתוחים, ממוינים לפי תאריך יצירה (החדשים ראשונים)
    const events = await Event.find({ status: 'פתוח' })
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      events,
      count: events.length 
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      message: 'שגיאה בטעינת האירועים',
      error: error.message 
    });
  }
};

// ספירת אירועים פתוחים - למוזיקאים פעילים (לאינדיקטור)
const getOpenEventsCount = async (req, res) => {
  try {
    // בדיקה שהמשתמש מחובר
    if (!req.user || !req.user.userId) {
      return res.status(200).json({ count: 0 });
    }

    // בדיקה שהמשתמש הוא מוזיקאי פעיל
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(200).json({ count: 0 });
    }

    const hasActiveProfile = user.musicianProfile && 
                            user.musicianProfile.length > 0 && 
                            user.musicianProfile[0].isActive === true;

    if (!hasActiveProfile) {
      return res.status(200).json({ count: 0 });
    }

    // ספירת אירועים פתוחים
    const count = await Event.countDocuments({ status: 'פתוח' });

    res.status(200).json({ count });

  } catch (error) {
    console.error('Error counting events:', error);
    res.status(200).json({ count: 0 });
  }
};

// סגירת אירוע - כל מוזיקאי רשום יכול לסגור
const closeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // בדיקה שהמשתמש מחובר
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        message: 'נדרשת התחברות' 
      });
    }

    // בדיקה שהמשתמש הוא מוזיקאי
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.isMusician) {
      return res.status(403).json({ 
        message: 'רק מוזיקאים יכולים לסגור אירועים' 
      });
    }

    // מציאת האירוע ועדכון
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ 
        message: 'אירוע לא נמצא' 
      });
    }

    if (event.status === 'סגור') {
      return res.status(400).json({ 
        message: 'האירוע כבר סגור' 
      });
    }

    // עדכון האירוע לסגור
    event.status = 'סגור';
    event.closedBy = req.user.userId;
    event.closedAt = new Date();

    await event.save();

    res.status(200).json({ 
      message: 'האירוע נסגר בהצלחה!',
      event 
    });

  } catch (error) {
    console.error('Error closing event:', error);
    res.status(500).json({ 
      message: 'שגיאה בסגירת האירוע',
      error: error.message 
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getOpenEventsCount,
  closeEvent
};
