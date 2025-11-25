import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateMusicianProfile.css';

// CreateMusicianProfile - רכיב יחיד ומלא ליצירת/עדכון פרופיל מוזיקאי
// הערות חשובות:
// - קומפוננטה זו תומכת בשדות טקסט + העלאת תמונות/וידאו (FormData).
// - היא מצפה ש-token יישמר ב-localStorage תחת 'token' כדי לשלוח Authorization.
// - אם יש קבצים נשלח FormData, אחרת נשלח JSON ל-API.
// - ה-API כאן מכוון ל-'http://localhost:3000/user/musician/profile' (ניתן לשנות).
export default function CreateMusicianProfile() {
  // הערה: קומפוננטה ליצירת/עדכון פרופיל מוזיקאי

  // state של הטופס - שדות מרכזיים
  const [form, setForm] = useState({
    instrument: '',
    musictype: '',
    experienceYears: '',
    eventTypes: '',
    bio: '',
    // change location to region: 'north' | 'center' | 'south' (keeps compatibility)
    location: '',
    region: ''
  });

  // רשימת סגנונות מוזיקליים לבחירה (ניתן לבחור יותר מאחד)
  const musicStyles = [
    'חסידי',
    'ליטאי',
    'דתי לאומי',
    'מזרחי',
    'פיוטים',
    'עממי',
    'ים תיכוני',
    'ישראלי'
  ];

  // רשימת כלי נגינה - תואם לחיפוש ב-Home
  const INSTRUMENT_OPTIONS = [
    "גיטרה אקוסטית",
    "גיטרה חשמלית",
    "גיטרה בס",
    "פסנתר",
    "קלידים / אורגן",
    "כינור",
    "תופים",
    "דרבוקה",
    "קחון",
    "טמבורין",
    "בונגו",
    "קונגה",
    "תופי מרים",
    "סקסופון",
    "קלרינט",
    "חצוצרה",
    "טרומבון",
    "חליל צד",
    "חליל ערבי (ניי)",
    "עוד",
    "בוזוקי",
    "קאנון",
    "די.ג'יי",
  ];

  // רשימת סוגי אירועים - תואם לחיפוש ב-Home
  const EVENT_OPTIONS = [
    'חתונה',
    'בר מצווה',
    'שבת חתן',
    'ברית',
    'אירוע אירוסין',
    'יום הולדת',
    'חינה',
    'אירוע משפחתי',
    'אירוע חברה',
    'טקס / כנס',
    'מופע קהילתי',
    'קבלת פנים',
    'חפלה',
    'שירה בציבור',
    'הופעה חיה'
  ];

  // state לשמירת סגנונות שנבחרו (מחרוזות)
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [stylesError, setStylesError] = useState('');
  // כלי נגינה וסוגי אירועים ניתנים לבחירה (מרובי ערכים)
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);

  // state לקבצים והודעות סטטוס
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isInstrumentsOpen, setIsInstrumentsOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  // ---------------------------------------------
  // Profile picture state (תמונת פרופיל)
  // - `profilePicture`: האובייקט File שהמשתמש בחר (או null אם לא נבחר)
  //   שדה זה ישמש בעתיד לצורך שליחה לשרת בתוך FormData:
  //     fd.append('profilePicture', profilePicture)
  // - `profilePreview`: כתובת זמנית (object URL) להצגה מיידית בעיגול.
  //   זו אינה כתובת שמורה בשרת — לאחר העלאה יש להחליפה ב-URL שהשרת מחזיר.
  // הערה חשובה: אנחנו משתמשים ב-URL.createObjectURL(file) עבור preview,
  // ויש לנקות אותו אחר כך עם URL.revokeObjectURL כדי למנוע זליגות זיכרון.
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  // refs לשדות קובץ (לא חובה אבל שימושי לאיפוס)
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // בדיקת אימות - רק משתמש מחובר יכול ליצור פרופיל
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('עליך להתחבר כדי ליצור פרופיל מוזיקאי');
      setTimeout(() => navigate('/authforms'), 1500);
    }
  }, [navigate]);
  // --------------------------------------------------
  // הערות על ה-ref:
  // - `profileInputRef` מצביע על input[type=file] שהסתרנו (display:none).
  // - כאשר המשתמש לוחץ על ה"עיגול" (div עם className="profile-preview"),
  //   אנו קוראים ל-profileInputRef.current.click() כדי לפתוח את דיאלוג הבחירה.
  // - שימוש ב-ref מבטיח חוויית משתמש חלקה ומאפשר לעצב את הכפתור כעצם כללי.

  // handler לשינוי ערכים בטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    // לולא מדובר בביאור (bio) - עדכון רגיל
    if (name !== 'bio') {
      setForm(prev => ({ ...prev, [name]: value }));
      return;
    }

    // עבור שדה הביוגרפיה - אכוף הגבלת תווים ל-250
    const MAX = 250;
    const truncated = value.slice(0, MAX);
    setForm(prev => ({ ...prev, bio: truncated }));
  };

  // שינוי בבחירת סגנון מוזיקלי - toggle ברשימת הסגנונות
  const handleStyleToggle = (style) => {
    setStylesError('');
    setSelectedStyles(prev => {
      if (prev.includes(style)) {
        return prev.filter(s => s !== style);
      }
      return [...prev, style];
    });
  };

  const handleInstrumentToggle = (instr) => {
    setSelectedInstruments(prev => prev.includes(instr) ? prev.filter(i=> i!==instr) : [...prev, instr]);
  };

  const handleEventToggle = (ev) => {
    setSelectedEventTypes(prev => prev.includes(ev) ? prev.filter(e=> e!==ev) : [...prev, ev]);
  };

  // סנכרן את בחירות הסגנונות לשדה form.musictype (שמירה/שליחה נוחה)
  useEffect(() => {
    setForm(prev => ({ ...prev, musictype: selectedStyles.join(', ') }));
  }, [selectedStyles]);

  // סנכרן בחירות כלים וסוגי אירועים לשדות המתאימים ב-form
  useEffect(() => {
    setForm(prev => ({ ...prev, instrument: selectedInstruments.join(', '), eventTypes: selectedEventTypes.join(', ') }));
  }, [selectedInstruments, selectedEventTypes]);

  // עזר המפריד רשימת ערכים המוזנת כמחרוזת מופרדת בפסיק
  const toArray = (s) => {
    if (!s) return [];
    return s.split(',').map(x => x.trim()).filter(Boolean);
  };

  // handlers לקבצים - ממירים ל-array כדי לעבוד איתם
  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const handleVideos = (e) => {
    const files = Array.from(e.target.files || []);
    setVideos(files);
  };

  // מטפל בבחירת תמונת פרופיל ומייצר preview
  const handleProfilePicture = (e) => {
    // קבל את הקובץ הראשון (רק תמונה יחידה לשדה פרופיל)
    const f = e.target.files && e.target.files[0];
    if (!f) {
      // בחרו 'בטל' בדיאלוג או מחיקה - ננקה את ה-state וה-preview
      setProfilePicture(null);
      setProfilePreview(null);
      return;
    }

    // עדכון ה-state עם האובייקט File שנבחר
    // NOTE: האובייקט הזה ניתן לשליחה לשרת בתוך FormData
    setProfilePicture(f);

    // צור כתובת זמנית להצגה מיידית (לא שמורה בשרת)
    // שימוש ב-URL.createObjectURL מהיר ונוח להצגת preview
    const url = URL.createObjectURL(f);
    setProfilePreview(url);

    // הערה על אבטחה ולידציה (יש לבצע גם בצד השרת):
    // - בדוק סוג קובץ (f.type) וגדלים (f.size) לפני שליחה.
    // - הימנע מהצגת קבצי SVG שעשויים להכיל קוד מזיק ללא סינון.
  };

  // נקה את ה-object URL כשה-komponent מתפרק או כשה-preview משתנה
  useEffect(() => {
    // נקווה לנקות את ה-object URL כאשר ה-component מתפרק
    // או כאשר ה-preview משתנה כדי למנוע זליגות זיכרון בדפדפן.
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  // סגור את ה-dropdown כשנקשה מחוץ אליו
  const dropdownRef = React.useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsStylesOpen(false);
        setIsInstrumentsOpen(false);
        setIsEventsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();

      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('עליך להתחבר כדי ליצור פרופיל');
        setTimeout(() => navigate('/authforms'), 1200);
        return;
      }

      if (!selectedStyles || selectedStyles.length === 0) {
        setStylesError('בחר/י לפחות סגנון מוזיקלי אחד');
        return;
      }

      if (!selectedInstruments || selectedInstruments.length === 0) {
        setError('בחר/י לפחות כלי נגינה אחד');
        return;
      }

      setLoading(true);
      try {
        const locationArray = [];
        if (form.region) locationArray.push(form.region);
        if (form.location) locationArray.push(form.location);

        const payload = {
          instrument: form.instrument || selectedInstruments.join(', '),
          musictype: form.musictype || selectedStyles.join(', '),
          experienceYears: form.experienceYears || '0',
          eventTypes: form.eventTypes ? form.eventTypes.split(',').map(x => x.trim()).filter(Boolean) : selectedEventTypes,
          bio: form.bio || '',
          location: locationArray,
          profilePicture: profilePreview || '',
          galleryPictures: images.map(f => f.name || ''),
          galleryVideos: videos.map(f => f.name || '')
        };

        const res = await api.updateMusicianProfile(payload);
        setSuccess(res && (res.message || 'הפרופיל נשמר בהצלחה!'));
      } catch (err) {
        console.error(err);
        const msg = err && (err.message || err.error) ? (err.message || err.error) : 'שגיאה בשמירת הפרופיל';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="create-musician-page">
        <div className="container">
          <h2>צור או עדכן פרופיל מוזיקאי</h2>

          {profilePicture && (
            <div className="action-row" style={{ justifyContent: 'center', marginTop: 8 }}>
              <button
                type="button"
                className="profile-remove-btn"
                onClick={() => {
                  if (profilePreview) URL.revokeObjectURL(profilePreview);
                  setProfilePicture(null);
                  setProfilePreview(null);
                  if (profileInputRef && profileInputRef.current) profileInputRef.current.value = null;
                }}
              >הסר תמונה</button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">כלי נגינה (בחר/י אחד או יותר) *</label>
                <div className="styles-dropdown" style={{ position: 'relative' }}>
                  <button type="button" className="dropdown-toggle" onClick={() => setIsInstrumentsOpen(p => !p)}>
                    {selectedInstruments.length === 0 ? 'בחר/י כלי נגינה...' : selectedInstruments.join(', ')}
                  </button>
                  {isInstrumentsOpen && (
                    <div className="dropdown-list">
                      {INSTRUMENT_OPTIONS.map(instr => (
                        <label key={instr} className="dropdown-item">
                          <input type="checkbox" checked={selectedInstruments.includes(instr)} onChange={() => handleInstrumentToggle(instr)} />
                          <span>{instr}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">סגנון מוזיקלי (ניתן לבחור יותר מאחד) *</label>
                <div className="styles-dropdown" style={{ position: 'relative' }}>
                  <button type="button" className="dropdown-toggle" onClick={() => setIsStylesOpen(p => !p)}>
                    {selectedStyles.length === 0 ? 'בחר/י סגנונות...' : selectedStyles.join(', ')}
                  </button>
                  {isStylesOpen && (
                    <div className="dropdown-list">
                      {musicStyles.map(style => (
                        <label key={style} className="dropdown-item">
                          <input type="checkbox" checked={selectedStyles.includes(style)} onChange={() => handleStyleToggle(style)} />
                          <span>{style}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {stylesError && <div className="error-message">{stylesError}</div>}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">שנות ניסיון</label>
                <input name="experienceYears" type="number" min="0" className="form-input" value={form.experienceYears} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">סוגי אירועים (בחר/י)</label>
                <div className="styles-dropdown" style={{ position: 'relative' }}>
                  <button type="button" className="dropdown-toggle" onClick={() => setIsEventsOpen(p => !p)}>
                    {selectedEventTypes.length === 0 ? 'בחר/י סוגי אירועים...' : selectedEventTypes.join(', ')}
                  </button>
                  {isEventsOpen && (
                    <div className="dropdown-list">
                      {EVENT_OPTIONS.map(ev => (
                        <label key={ev} className="dropdown-item">
                          <input type="checkbox" checked={selectedEventTypes.includes(ev)} onChange={() => handleEventToggle(ev)} />
                          <span>{ev}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ביוגרפיה</label>
              <textarea name="bio" className="form-input" rows={4} value={form.bio} onChange={handleChange} />
              <div className="bio-counter"><span>{(form.bio ? form.bio.length : 0)} / 250</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">אזור/הופעות</label>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <select name="region" value={form.region} onChange={handleChange} className="form-input" style={{width:220}}>
                  <option value="">בחר אזור</option>
                  <option value="north">צפון</option>
                  <option value="center">מרכז</option>
                  <option value="south">דרום</option>
                </select>
                <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="עיר/אזור מדויק (אופציונלי)" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">הוספת תמונות הופעה (תמיכה בקבצים מרובים)</label>
                <div className="file-input-wrapper">
                  <label className="file-trigger file-action-btn">
                    <input ref={imageInputRef} className="hidden-file-input" type="file" accept="image/*" multiple onChange={handleImages} />
                    <span>בחר תמונות</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">הוספת סרטונים (וידאו)</label>
                <div className="file-input-wrapper">
                  <label className="file-trigger file-action-btn">
                    <input ref={videoInputRef} className="hidden-file-input" type="file" accept="video/*" multiple onChange={handleVideos} />
                    <span>בחר סרטונים</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="action-row">
              <button type="submit" className={`submit-button ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? <span className="loader"/> : 'שמור פרופיל'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}
