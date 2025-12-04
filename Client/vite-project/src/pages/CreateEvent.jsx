import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import './CreateEvent.css';

// טופס לפרסום אירוע — רק למשתמשים רשומים
export default function CreateEvent() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form, setForm] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    eventType: 'חתונה',
    eventDate: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // בדיקה אם המשתמש מחובר
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקה נוספת לפני שליחה
    if (!isLoggedIn) {
      setMessage({ type: 'error', text: 'יש להתחבר כדי לפרסם אירוע' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // המרה למספרים אם מולאו
      const payload = {
        ...form,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      };
      await eventsApi.createEvent(payload);
      setMessage({ type: 'success', text: 'האירוע פורסם בהצלחה! 🎉 מעבר לדף האירועים שלי...' });
      setForm({
        contactName: '', contactPhone: '', contactEmail: '', eventType: 'חתונה',
        eventDate: '', location: '', budgetMin: '', budgetMax: '', description: ''
      });
      // מעבר לדף האירועים שלי אחרי 2 שניות
      setTimeout(() => navigate('/my-events'), 2000);
    } catch (e) {
      const errorMsg = e?.message || 'שגיאה בפרסום האירוע';
      if (errorMsg.includes('התחבר')) {
        setMessage({ type: 'error', text: 'יש להתחבר כדי לפרסם אירוע. מעבר לדף התחברות...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  // אם המשתמש לא מחובר, הצג הודעה
  if (!isLoggedIn) {
    return (
      <div className="create-event-container">
        <div className="create-event-card login-required">
          <div className="login-required-icon">🔒</div>
          <h2 className="login-required-title">נדרשת התחברות</h2>
          <p className="login-required-text">
            כדי לפרסם אירוע חדש, עליך להיות משתמש רשום במערכת.
            <br />
            לאחר ההתחברות תוכל לפרסם, לערוך ולמחוק את האירועים שלך.
          </p>
          <div className="login-required-buttons">
            <button className="btn primary-btn" onClick={() => navigate('/login')}>
              התחברות
            </button>
            <button className="btn secondary-btn" onClick={() => navigate('/register')}>
              הרשמה
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-container">
      <div className="create-event-card">
        <div className="form-header">
          <div className="form-icon">🎵</div>
          <h1 className="form-title">פרסום אירוע חדש</h1>
          <p className="form-subtitle">מלא את הפרטים למטה ומוזיקאים יוכלו ליצור איתך קשר</p>
        </div>

        <form onSubmit={onSubmit} className="event-form">
          <div className="form-section">
            <h3 className="section-title">פרטי איש קשר</h3>
            
            <label className="form-label">
              <span className="label-text">שם מלא *</span>
              <input 
                className="form-input"
                name="contactName" 
                value={form.contactName} 
                onChange={onChange} 
                placeholder="לדוגמה: יוסי כהן"
                required 
              />
            </label>

            <label className="form-label">
              <span className="label-text">מספר טלפון *</span>
              <input 
                className="form-input"
                name="contactPhone" 
                value={form.contactPhone} 
                onChange={onChange} 
                placeholder="050-1234567"
                required 
              />
            </label>

            <label className="form-label">
              <span className="label-text">אימייל (אופציונלי)</span>
              <input 
                className="form-input"
                type="email"
                name="contactEmail" 
                value={form.contactEmail} 
                onChange={onChange} 
                placeholder="example@email.com"
              />
            </label>
          </div>

          <div className="form-section">
            <h3 className="section-title">פרטי האירוע</h3>
            
            <label className="form-label">
              <span className="label-text">סוג אירוע *</span>
              <select className="form-select" name="eventType" value={form.eventType} onChange={onChange}>
                <option>חתונה</option>
                <option>בר/בת מצווה</option>
                <option>ברית/בריתה</option>
                <option>אירוע פרטי</option>
                <option>מסיבה</option>
                <option>אירוע עסקי</option>
                <option>אחר</option>
              </select>
            </label>

            <label className="form-label">
              <span className="label-text">תאריך האירוע *</span>
              <input 
                className="form-input"
                type="date" 
                name="eventDate" 
                value={form.eventDate} 
                onChange={onChange} 
                required 
              />
            </label>

            <label className="form-label">
              <span className="label-text">מיקום האירוע *</span>
              <input 
                className="form-input"
                name="location" 
                value={form.location} 
                onChange={onChange} 
                placeholder="לדוגמה: תל אביב, אולם אירועים XYZ"
                required 
              />
            </label>
          </div>

          <div className="form-section">
            <h3 className="section-title">תקציב (אופציונלי)</h3>
            
            <div className="budget-row">
              <label className="form-label">
                <span className="label-text">מינימום (₪)</span>
                <input 
                  className="form-input"
                  type="number" 
                  name="budgetMin" 
                  value={form.budgetMin} 
                  onChange={onChange} 
                  placeholder="1000"
                />
              </label>

              <label className="form-label">
                <span className="label-text">מקסימום (₪)</span>
                <input 
                  className="form-input"
                  type="number" 
                  name="budgetMax" 
                  value={form.budgetMax} 
                  onChange={onChange} 
                  placeholder="5000"
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              <span className="label-text">תיאור האירוע *</span>
              <textarea 
                className="form-textarea"
                name="description" 
                value={form.description} 
                onChange={onChange} 
                placeholder="ספר לנו על האירוע שלך - איזה אווירה אתה מחפש, כמה אורחים, האם יש דרישות מיוחדות..."
                rows="5"
                required 
              />
              <span className="input-hint">{form.description.length}/500 תווים</span>
            </label>
          </div>

          {message && (
            <div className={`message-box ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-actions">
            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? '⏳ מפרסם...' : '✨ פרסם אירוע'}
            </button>
            <a className="btn-cancel" href="/events">❌ ביטול</a>
          </div>
        </form>
      </div>
    </div>
  );
}
