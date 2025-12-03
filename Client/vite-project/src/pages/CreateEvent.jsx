import { useState } from 'react';
import { eventsApi } from '../services/api';
import './CreateEvent.css';

// טופס פשוט לפרסום אירוע — פתוח לכולם
export default function CreateEvent() {
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
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
      setMessage({ type: 'success', text: 'האירוע פורסם בהצלחה! 🎉' });
      setForm({
        contactName: '', contactPhone: '', contactEmail: '', eventType: 'חתונה',
        eventDate: '', location: '', budgetMin: '', budgetMax: '', description: ''
      });
    } catch (e) {
      setMessage({ type: 'error', text: e?.message || 'שגיאה בפרסום האירוע' });
    } finally {
      setLoading(false);
    }
  };

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
