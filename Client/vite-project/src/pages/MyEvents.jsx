import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import './MyEvents.css';

export default function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      const data = await eventsApi.getMyEvents();
      setEvents(data.events || []);
    } catch (e) {
      if (e?.message?.includes('התחברות')) {
        navigate('/login');
      } else {
        setMessage({ type: 'error', text: 'שגיאה בטעינת האירועים' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) return;
    
    try {
      await eventsApi.deleteEvent(eventId);
      setMessage({ type: 'success', text: 'האירוע נמחק בהצלחה!' });
      loadMyEvents();
    } catch (e) {
      setMessage({ type: 'error', text: e?.message || 'שגיאה במחיקת האירוע' });
    }
  };

  const handleEdit = (event) => {
    setEditingEvent({
      ...event,
      eventDate: new Date(event.eventDate).toISOString().split('T')[0]
    });
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setMessage(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await eventsApi.updateEvent(editingEvent._id, editingEvent);
      setMessage({ type: 'success', text: 'האירוע עודכן בהצלחה!' });
      setEditingEvent(null);
      loadMyEvents();
    } catch (e) {
      setMessage({ type: 'error', text: e?.message || 'שגיאה בעדכון האירוע' });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingEvent(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="my-events-container">
        <div className="loading">טוען את האירועים שלך...</div>
      </div>
    );
  }

  return (
    <div className="my-events-container">
      <div className="my-events-header">
        <h1 className="my-events-title">האירועים שלי</h1>
        <button className="btn primary-btn" onClick={() => navigate('/create-event')}>
          + פרסם אירוע חדש
        </button>
      </div>

      {message && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      {events.length === 0 ? (
        <div className="no-events">
          <div className="no-events-icon">📅</div>
          <h2>אין לך אירועים פעילים</h2>
          <p>פרסם אירוע חדש כדי למצוא מוזיקאים!</p>
          <button className="btn primary-btn" onClick={() => navigate('/create-event')}>
            פרסם אירוע ראשון
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event._id} className={`event-card ${editingEvent && editingEvent._id === event._id ? 'editing' : ''}`}>
              {editingEvent && editingEvent._id === event._id ? (
                <form onSubmit={handleSaveEdit} className="edit-form">
                  <h3 className="edit-title">עריכת אירוע</h3>
                  
                  <label className="form-label">
                    <span className="label-text">שם איש קשר</span>
                    <input
                      className="form-input"
                      name="contactName"
                      value={editingEvent.contactName}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label className="form-label">
                    <span className="label-text">טלפון</span>
                    <input
                      className="form-input"
                      name="contactPhone"
                      value={editingEvent.contactPhone}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label className="form-label">
                    <span className="label-text">אימייל</span>
                    <input
                      className="form-input"
                      type="email"
                      name="contactEmail"
                      value={editingEvent.contactEmail || ''}
                      onChange={handleEditChange}
                    />
                  </label>

                  <label className="form-label">
                    <span className="label-text">סוג אירוע</span>
                    <select
                      className="form-select"
                      name="eventType"
                      value={editingEvent.eventType}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="חתונה">חתונה</option>
                      <option value="בר/בת מצווה">בר/בת מצווה</option>
                      <option value="ברית/בריתה">ברית/בריתה</option>
                      <option value="אירוע פרטי">אירוע פרטי</option>
                      <option value="מסיבה">מסיבה</option>
                      <option value="אירוע עסקי">אירוע עסקי</option>
                      <option value="אחר">אחר</option>
                    </select>
                  </label>

                  <label className="form-label">
                    <span className="label-text">תאריך</span>
                    <input
                      className="form-input"
                      type="date"
                      name="eventDate"
                      value={editingEvent.eventDate}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label className="form-label">
                    <span className="label-text">מיקום</span>
                    <input
                      className="form-input"
                      name="location"
                      value={editingEvent.location}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label className="form-label">
                    <span className="label-text">תיאור</span>
                    <textarea
                      className="form-textarea"
                      name="description"
                      value={editingEvent.description}
                      onChange={handleEditChange}
                      rows="4"
                      required
                    />
                  </label>

                  <div className="edit-buttons">
                    <button type="submit" className="btn primary-btn">
                      שמור שינויים
                    </button>
                    <button type="button" className="btn secondary-btn" onClick={handleCancelEdit}>
                      ביטול
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="event-header">
                    <h3 className="event-title">{event.eventType}</h3>
                    <span className={`event-status ${event.status === 'פתוח' ? 'open' : 'closed'}`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="event-details">
                    <div className="event-detail">
                      <span className="detail-label">📅 תאריך:</span>
                      <span className="detail-value">
                        {new Date(event.eventDate).toLocaleDateString('he-IL')}
                      </span>
                    </div>

                    <div className="event-detail">
                      <span className="detail-label">📍 מיקום:</span>
                      <span className="detail-value">{event.location}</span>
                    </div>

                    <div className="event-detail">
                      <span className="detail-label">👤 איש קשר:</span>
                      <span className="detail-value">{event.contactName}</span>
                    </div>

                    <div className="event-detail">
                      <span className="detail-label">📞 טלפון:</span>
                      <span className="detail-value">{event.contactPhone}</span>
                    </div>

                    {event.contactEmail && (
                      <div className="event-detail">
                        <span className="detail-label">📧 אימייל:</span>
                        <span className="detail-value">{event.contactEmail}</span>
                      </div>
                    )}

                    <div className="event-description">
                      <span className="detail-label">📝 תיאור:</span>
                      <p className="detail-value">{event.description}</p>
                    </div>
                  </div>

                  <div className="event-actions">
                    <button className="btn edit-btn" onClick={() => handleEdit(event)}>
                      ✏️ ערוך
                    </button>
                    <button className="btn delete-btn" onClick={() => handleDelete(event._id)}>
                      🗑️ מחק
                    </button>
                  </div>

                  <div className="event-meta">
                    <small>
                      פורסם ב-{new Date(event.createdAt).toLocaleDateString('he-IL')}
                    </small>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
