import React, { useState, useRef, useEffect } from 'react';
import './CreateMusicianProfile.css';

// CreateMusicianProfile - רכיב יחיד ומלא ליצירת/עדכון פרופיל מוזיקאי
// הערות חשובות:
// - קומפוננטה זו תומכת בשדות טקסט + העלאת תמונות/וידאו (FormData).
// - היא מצפה ש-token יישמר ב-localStorage תחת 'token' כדי לשלוח Authorization.
// - אם יש קבצים נשלח FormData, אחרת נשלח JSON ל-API.
// - ה-API כאן מכוון ל-'http://localhost:3000/user/musician/profile' (ניתן לשנות).
export default function CreateMusicianProfile() {
  // הערה: כרגע לא מבצעים הפניות אוטומטיות — הרכיב ויזואלי בלבד

  // state של הטופס - שדות מרכזיים
  const [form, setForm] = useState({
    instrument: '',
    musictype: '',
    experienceYears: '',
    eventTypes: '',
    bio: '',
    location: ''
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

  // state לשמירת סגנונות שנבחרו (מחרוזות)
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [stylesError, setStylesError] = useState('');

  // state לקבצים והודעות סטטוס
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // refs לשדות קובץ (לא חובה אבל שימושי לאיפוס)
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const profileInputRef = useRef(null);

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

  // סנכרן את בחירות הסגנונות לשדה form.musictype (שמירה/שליחה נוחה)
  useEffect(() => {
    setForm(prev => ({ ...prev, musictype: selectedStyles.join(', ') }));
  }, [selectedStyles]);

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
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // שליחת הטופס - בונה את הבקשה לפי האם קיימים קבצים
  // Handler פשוט לשמירה ויזואלית בלבד (ללא קריאות לשרת)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // ודא שנבחר לפחות סגנון מוזיקלי אחד
    if (!selectedStyles || selectedStyles.length === 0) {
      setStylesError('בחר/י לפחות סגנון מוזיקלי אחד');
      setLoading(false);
      return;
    }

    try {
      // סימולציה קצרה של שמירה מקומית (למטרות ויזואליות בלבד)
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccess('הפרופיל נשמר (מקומי)');
      // לא מבצעים שום fetch או הפניה — רק תצוגה
    } catch (err) {
      setError('שגיאה מקומית');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{background:'linear-gradient(135deg,#f0f4ff, #fbf7ff)'}}>
      <div className="auth-card" style={{maxWidth:800}} dir="rtl">
        <div className="auth-header">
          <h1 className="auth-title" style={{background:'none',WebkitTextFillColor:'#333',color:'#333'}}>צור פרופיל מוזיקאי</h1>
          <p className="auth-subtitle">מלא/י את הפרטים כדי להציג את עצמך באתר</p>
        </div>

        {/* Upload profile picture - העיגול עם תמונה/אייקון מעל הטופס */}
        {/* כיתוב מעל המעגל: תווית ברורה עבור שדה תמונת פרופיל */}
        <div className="profile-label">תמונת פרופיל</div>
        <div className="profile-uploader">
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleProfilePicture}
          />
          <div
            className="profile-preview"
            onClick={() => profileInputRef.current && profileInputRef.current.click()}
            role="button"
            title="לחץ להעלאת תמונת פרופיל"
          >
            {profilePreview ? (
              <img src={profilePreview} alt="profile preview" />
            ) : (
              <div className="profile-placeholder">+</div>
            )}
          </div>
        </div>
        {/* טקסט עזר מתחת לעיגול שמסביר את הפעולה למשתמש */}
        <div className="profile-hint">לחץ על העיגול כדי להוסיף או לשנות תמונת פרופיל</div>

        {/* כפתור להסרת תמונת פרופיל - נראה רק כאשר יש תמונה */}
        {profilePicture && (
          <div className="action-row" style={{ justifyContent: 'center', marginTop: 8 }}>
            <button
              type="button"
              className="profile-remove-btn"
              onClick={() => {
                // נקה את ה-state ואת ה-preview וגם איפס את ה-input
                if (profilePreview) {
                  URL.revokeObjectURL(profilePreview);
                }
                setProfilePicture(null);
                setProfilePreview(null);
                if (profileInputRef && profileInputRef.current) profileInputRef.current.value = null;
              }}
            >הסר תמונה</button>
          </div>
        )}

        {error && <div className="success-message" style={{background:'#ffdede', color:'#a00000'}}>{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">כלי נגינה (instrument) *</label>
              <input name="instrument" className="form-input" value={form.instrument} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">סגנון מוזיקלי (ניתן לבחור יותר מאחד) *</label>
              <div className="styles-dropdown" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="dropdown-toggle"
                  onClick={() => setIsDropdownOpen(prev => !prev)}
                  aria-expanded={isDropdownOpen}
                >
                  {selectedStyles.length === 0 ? 'בחר/י סגנונות...' : selectedStyles.join(', ')}
                </button>

                {isDropdownOpen && (
                  <div className="dropdown-list" style={{ position: 'absolute', zIndex: 50, background: '#fff', border: '1px solid #ddd', padding: 8, borderRadius: 6, maxHeight: 220, overflowY: 'auto' }}>
                    {musicStyles.map(style => (
                      <label key={style} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="musictype"
                          value={style}
                          checked={selectedStyles.includes(style)}
                          onChange={() => handleStyleToggle(style)}
                        />
                        <span>{style}</span>
                      </label>
                    ))}
                  </div>
                )}

              </div>
              {stylesError && <div className="error-message">{stylesError}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">שנות ניסיון</label>
              <input name="experienceYears" type="number" min="0" className="form-input" value={form.experienceYears} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">סוגי אירועים (מופרדים בפסיק)</label>
              <input name="eventTypes" className="form-input" value={form.eventTypes} onChange={handleChange} placeholder="bar mizva, hatuna" />
            </div>
          </div>

          <div className="form-group">
              <label className="form-label">ביוגרפיה</label>
              {/* שדה ביוגרפיה - מוגבל ל-250 תווים. הצגתי גם ספירת מילים/תווים מחושבת */}
              <div style={{ position: 'relative' }}>
                <textarea name="bio" className="form-input" rows={4} value={form.bio} onChange={handleChange} />
                <div className="bio-counter">
                  {/* תצוגת תווים בשימוש: 'X / 250' בצד שמאל-תחתון */}
                  <span>{(form.bio ? form.bio.length : 0)} / 250</span>
                </div>
              </div>
          </div>

          <div className="form-group">
            <label className="form-label">אזור/הופעות (מופרדים בפסיק)</label>
            <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="Tel Aviv" />
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
