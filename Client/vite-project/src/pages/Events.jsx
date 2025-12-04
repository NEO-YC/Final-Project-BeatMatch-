import { useEffect, useState } from 'react';
import { eventsApi } from '../services/api';
import EventCard from '../components/EventCard';
import './Events.css';

// דף לוח אירועים: אם המשתמש אינו מוזיקאי פעיל, נראה הודעת תשלום.
// אם הוא פעיל — נטען ונציג אירועים פתוחים.
export default function Events() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventsApi.getOpenEvents();
        setEvents(data.events || []);
        setCurrentUserId(data.currentUserId || null);
        setNeedsPayment(false);
      } catch (e) {
        // אם השרת מחזיר needsPayment, נציג הודעה מתאימה
        if (e && e.needsLogin) {
          setNeedsLogin(true);
        } else if (e && (e.needsPayment || e.message?.includes('גישה למוזיקאים פעילים'))) {
          setNeedsPayment(true);
        } else if (e && (e.message?.includes('גישה נדחתה') || e.message?.includes('טוקן'))) {
          // כשאין טוקן בכלל
          setNeedsLogin(true);
        } else {
          setError(e?.message || 'שגיאה בטעינת האירועים');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="events-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>טוען אירועים...</p>
        </div>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="events-container">
        <div className="payment-notice">
          <div className="payment-icon">🎭</div>
          <h2>מעוניין לפרסם אירוע מזדמן?</h2>
          <p>
            הירשם לאתר כדי לפרסם אירועים ולחפש מוזיקאים מקצועיים לאירוע שלך!
          </p>
          <div className="payment-actions">
            <a href="/register" className="btn-primary">הירשם עכשיו</a>
            <a href="/login" className="btn-secondary">יש לי חשבון - התחבר</a>
          </div>
        </div>
      </div>
    );
  }

  if (needsPayment) {
    return (
      <div className="events-container">
        <div className="payment-notice">
          <div className="payment-icon">🎵</div>
          <h2>לוח אירועים — למוזיקאים PRO בלבד</h2>
          <p>
            רוצה לראות אירועים ולהגדיל הכנסות? הפוך את הפרופיל שלך לפעיל בתשלום קצר ותהנה מגישה מלאה ללוח האירועים.
          </p>
          <div className="payment-actions">
            <a href="/musician/edit" className="btn-primary">שדרג לחבר PRO</a>
            <a href="/my-events" className="btn-secondary">האירועים שלי</a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-container">
        <div className="error-state">
          <h2>⚠️ {error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1 className="events-title">🎉 לוח אירועים פתוחים</h1>
        <a href="/create-event" className="btn-create-event">+ פרסם אירוע חדש</a>
      </div>
      
      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>אין כרגע אירועים פתוחים</p>
          <a href="/create-event" className="btn-secondary">היה הראשון לפרסם</a>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(ev => (
            <EventCard 
              key={ev._id} 
              event={ev} 
              currentUserId={currentUserId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );

  async function handleUpdate(id, updates) {
    try {
      const updated = await eventsApi.updateEvent(id, updates);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, ...updates } : e));
      alert('האירוע עודכן בהצלחה!');
    } catch (e) {
      alert(e?.message || 'שגיאה בעדכון האירוע');
    }
  }

  async function handleDelete(id) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) return;
    try {
      await eventsApi.deleteEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      alert('האירוע נמחק בהצלחה!');
    } catch (e) {
      alert(e?.message || 'שגיאה במחיקת האירוע');
    }
  }

}
