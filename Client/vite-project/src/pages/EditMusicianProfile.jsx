import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateMusicianProfile.css'; // משתמשים באותו עיצוב

// EditMusicianProfile - רכיב לעריכת פרופיל מוזיקאי קיים
// טוען את הנתונים הקיימים ומאפשר עדכון
export default function EditMusicianProfile() {
  const navigate = useNavigate();

  // state של הטופס - שדות מרכזיים
  const [form, setForm] = useState({
    instrument: '',
    musictype: '',
    experienceYears: '',
    eventTypes: '',
    bio: '',
    location: '',
    region: ''
  });

  // רשימת סגנונות מוזיקליים לבחירה
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

  // רשימת כלי נגינה
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

  // רשימת סוגי אירועים
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

  // state לשמירת סגנונות שנבחרו
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [stylesError, setStylesError] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);

  // state לקבצים והודעות סטטוס
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isStylesOpen, setIsStylesOpen] = useState(false);
  const [isInstrumentsOpen, setIsInstrumentsOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true); // טעינת נתונים ראשונית
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // refs לשדות קובץ
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // בדיקת אימות - רק משתמש מחובר יכול לגשת
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // אין טוקן - הפנה להתחברות
      setError('עליך להתחבר כדי לערוך את הפרופיל שלך');
      setTimeout(() => navigate('/register'), 2000);
    }
  }, [navigate]);

  // טעינת הנתונים הקיימים מהשרת
  useEffect(() => {
    const fetchProfile = async () => {
      // בדוק שיש טוקן לפני שמנסה לטעון
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const res = await api.getMyMusicianProfile();
        
        if (res && res.musicianProfile) {
          const profile = res.musicianProfile;
          
          // מילוי הטופס עם הנתונים הקיימים
          // location הוא array - פריקה לשדות region ו-location
          let regionValue = '';
          let locationValue = '';
          
          if (Array.isArray(profile.location) && profile.location.length > 0) {
            // בדוק אם האיבר הראשון הוא north/center/south
            const firstItem = profile.location[0];
            if (['north', 'center', 'south', 'צפון', 'מרכז', 'דרום'].includes(firstItem)) {
              regionValue = firstItem;
              locationValue = profile.location[1] || '';
            } else {
              locationValue = firstItem;
            }
          }
          
          setForm({
            instrument: profile.instrument || '',
            musictype: profile.musictype || '',
            experienceYears: profile.experienceYears || '',
            eventTypes: Array.isArray(profile.eventTypes) ? profile.eventTypes.join(', ') : '',
            bio: profile.bio || '',
            location: locationValue,
            region: regionValue
          });

          // עדכון הבחירות מהנתונים הקיימים
          if (profile.instrument) {
            const instruments = profile.instrument.split(',').map(i => i.trim());
            setSelectedInstruments(instruments);
          }

          if (profile.musictype) {
            const styles = profile.musictype.split(',').map(s => s.trim());
            setSelectedStyles(styles);
          }

          if (profile.eventTypes && Array.isArray(profile.eventTypes)) {
            setSelectedEventTypes(profile.eventTypes);
          }

          // הצגת תמונת פרופיל אם קיימת
          if (profile.profilePicture) {
            setProfilePreview(profile.profilePicture);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('שגיאה בטעינת הפרופיל. אולי עדיין לא יצרת פרופיל?');
      } finally {
        setLoadingData(false);
      }
    };

    fetchProfile();
  }, []);

  // handler לשינוי ערכים בטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'bio') {
      setForm(prev => ({ ...prev, [name]: value }));
      return;
    }

    // עבור שדה הביוגרפיה - הגבלת תווים ל-250
    const MAX = 250;
    const truncated = value.slice(0, MAX);
    setForm(prev => ({ ...prev, bio: truncated }));
  };

  // שינוי בבחירת סגנון מוזיקלי
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

  // סנכרן את בחירות הסגנונות לשדה form.musictype
  useEffect(() => {
    setForm(prev => ({ ...prev, musictype: selectedStyles.join(', ') }));
  }, [selectedStyles]);

  // סנכרן בחירות כלים וסוגי אירועים
  useEffect(() => {
    setForm(prev => ({ ...prev, instrument: selectedInstruments.join(', '), eventTypes: selectedEventTypes.join(', ') }));
  }, [selectedInstruments, selectedEventTypes]);

  // handlers לקבצים
  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const handleVideos = (e) => {
    const files = Array.from(e.target.files || []);
    setVideos(files);
  };

  // מטפל בבחירת תמונת פרופיל
  const handleProfilePicture = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setProfilePicture(null);
      setProfilePreview(null);
      return;
    }

    setProfilePicture(f);
    const url = URL.createObjectURL(f);
    setProfilePreview(url);
  };

  // נקה את ה-object URL
  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview.startsWith('blob:')) {
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

  // שליחת הטופס - עדכון הפרופיל
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקה שהמשתמש מחובר לפני שליחה
    const token = localStorage.getItem('token');
    if (!token) {
      setError('עליך להתחבר כדי לעדכן את הפרופיל');
      setTimeout(() => navigate('/register'), 2000);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // ולידציות
    if (!selectedStyles || selectedStyles.length === 0) {
      setStylesError('בחר/י לפחות סגנון מוזיקלי אחד');
      setLoading(false);
      return;
    }

    if (!selectedInstruments || selectedInstruments.length === 0) {
      setError('בחר/י לפחות כלי נגינה אחד');
      setLoading(false);
      return;
    }

    try {
      // בניית location array - אם יש region או location מסוים
      const locationArray = [];
      if (form.region) locationArray.push(form.region);
      if (form.location) locationArray.push(form.location);
      
      const payload = {
        instrument: form.instrument,
        musictype: form.musictype,
        experienceYears: form.experienceYears || '0',
        eventTypes: form.eventTypes ? form.eventTypes.split(',').map(e => e.trim()).filter(Boolean) : [],
        bio: form.bio || '',
        location: locationArray,
        profilePicture: profilePreview || '',
        galleryPictures: [],
        galleryVideos: []
      };
      
      const res = await api.updateMusicianProfile(payload);
      setSuccess(res.message || 'הפרופיל עודכן בהצלחה! 🎉');
      
      // חזרה לדף הבית או לפרופיל אחרי 2 שניות
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Error updating musician profile:', err);
      const msg = (err && (err.message || err.error || err.msg)) ? (err.message || err.error || err.msg) : 'שגיאה בעדכון הפרופיל';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // אם עדיין טוען נתונים
  if (loadingData) {
    return (
      <div className="auth-container" style={{background:'linear-gradient(135deg,#f0f4ff, #fbf7ff)'}}>
        <div className="auth-card" style={{maxWidth:800}} dir="rtl">
          <div className="auth-header">
            <h1 className="auth-title" style={{background:'none',WebkitTextFillColor:'#333',color:'#333'}}>טוען פרופיל...</h1>
          </div>
          <div style={{textAlign:'center', padding:40}}>
            <span className="loader"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{background:'linear-gradient(135deg,#f0f4ff, #fbf7ff)'}}>
      <div className="auth-card" style={{maxWidth:800}} dir="rtl">
        <div className="auth-header">
          <h1 className="auth-title" style={{background:'none',WebkitTextFillColor:'#333',color:'#333'}}>עריכת פרופיל מוזיקאי</h1>
          <p className="auth-subtitle">עדכן/י את פרטי הפרופיל שלך</p>
        </div>

        {/* תמונת פרופיל */}
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
        <div className="profile-hint">לחץ על העיגול כדי להוסיף או לשנות תמונת פרופיל</div>

        {/* כפתור להסרת תמונת פרופיל */}
        {profilePicture && (
          <div className="action-row" style={{ justifyContent: 'center', marginTop: 8 }}>
            <button
              type="button"
              className="profile-remove-btn"
              onClick={() => {
                if (profilePreview && profilePreview.startsWith('blob:')) {
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
              <label className="form-label">כלי נגינה (בחר/י אחד או יותר) *</label>
              <div className="styles-dropdown" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="dropdown-toggle"
                  onClick={() => setIsInstrumentsOpen(prev => !prev)}
                  aria-expanded={isInstrumentsOpen}
                >
                  {selectedInstruments.length === 0 ? 'בחר/י כלי נגינה...' : selectedInstruments.join(', ')}
                </button>

                {isInstrumentsOpen && (
                  <div className="dropdown-list" style={{ position: 'absolute', zIndex: 50, background: '#fff', border: '1px solid #ddd', padding: 8, borderRadius: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {INSTRUMENT_OPTIONS.map(instr => (
                      <label key={instr} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="instrument"
                          value={instr}
                          checked={selectedInstruments.includes(instr)}
                          onChange={() => handleInstrumentToggle(instr)}
                        />
                        <span>{instr}</span>
                      </label>
                    ))}
                  </div>
                )}

              </div>
              {stylesError && <div className="error-message">{stylesError}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">סגנון מוזיקלי (ניתן לבחור יותר מאחד) *</label>
              <div className="styles-dropdown" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="dropdown-toggle"
                  onClick={() => setIsStylesOpen(prev => !prev)}
                  aria-expanded={isStylesOpen}
                >
                  {selectedStyles.length === 0 ? 'בחר/י סגנונות...' : selectedStyles.join(', ')}
                </button>
                {isStylesOpen && (
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
              <label className="form-label">סוגי אירועים (בחר/י)</label>
              <div className="styles-dropdown" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="dropdown-toggle"
                  onClick={() => setIsEventsOpen(prev => !prev)}
                  aria-expanded={isEventsOpen}
                >
                  {selectedEventTypes.length === 0 ? 'בחר/י סוגי אירועים...' : selectedEventTypes.join(', ')}
                </button>
                {isEventsOpen && (
                  <div className="dropdown-list" style={{ position: 'absolute', zIndex: 50, background: '#fff', border: '1px solid #ddd', padding: 8, borderRadius: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {EVENT_OPTIONS.map(ev => (
                      <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="eventTypes"
                          value={ev}
                          checked={selectedEventTypes.includes(ev)}
                          onChange={() => handleEventToggle(ev)}
                        />
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
              <div style={{ position: 'relative' }}>
                <textarea name="bio" className="form-input" rows={4} value={form.bio} onChange={handleChange} />
                <div className="bio-counter">
                  <span>{(form.bio ? form.bio.length : 0)} / 250</span>
                </div>
              </div>
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
              {loading ? <span className="loader"/> : 'עדכן פרופיל'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
