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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventsApi.getOpenEvents();
        setEvents(data.events || []);
        setNeedsPayment(false);
      } catch (e) {
        // אם השרת מחזיר needsPayment, נציג הודעה מתאימה
        if (e && e.needsPayment) {
          setNeedsPayment(true);
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

  if (needsPayment) {
    return (
      <div className="events-container">
        <div className="payment-notice">
          <div className="payment-icon">🎵</div>
          <h2>לוח אירועים — למוזיקאים פעילים בלבד</h2>
          <p>
            רוצה לראות אירועים ולהגדיל הכנסות? הפוך את הפרופיל שלך לפעיל בתשלום קצר ותהנה מגישה מלאה ללוח האירועים.
          </p>
          <div className="payment-actions">
            <a href="/" className="btn-primary">עבור להפעלת פרופיל</a>
            <a href="/create-event" className="btn-secondary">פרסם אירוע חדש</a>
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
            <EventCard key={ev._id} event={ev} onClose={handleClose} />
          ))}
        </div>
      )}
    </div>
  );

  async function handleClose(id) {
    try {
      await eventsApi.closeEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (e) {
      alert(e?.message || 'שגיאה בסגירת האירוע');
    }
  }

}
