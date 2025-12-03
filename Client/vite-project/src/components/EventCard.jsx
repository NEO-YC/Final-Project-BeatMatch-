// כרטיס אירוע נקי ופשוט עם עיצוב תואם האתר
import './EventCard.css'

export default function EventCard({ event, onClose }) {
  const dateStr = new Date(event.eventDate).toLocaleDateString('he-IL')
  const budgetStr = formatBudget(event)

  return (
    <div className="event-card">
      <div className="event-card-header">
        <div className="event-icon">
          🎵
        </div>
        <div className="event-header-info">
          <h3 className="event-type">{event.eventType}</h3>
          <div className="event-date">📅 {dateStr}</div>
        </div>
      </div>
      
      <div className="event-card-body">
        <div className="event-section">
          <div className="section-label">מיקום</div>
          <div className="event-value">📍 {event.location}</div>
        </div>
        
        <div className="event-section">
          <div className="section-label">תקציב</div>
          <div className="event-value">💰 {budgetStr}</div>
        </div>
        
        <div className="event-section">
          <div className="section-label">תיאור</div>
          <p className="event-desc">{event.description}</p>
        </div>
      </div>
      
      <div className="event-card-footer">
        <a className="event-btn secondary" href={`tel:${event.contactPhone}`}>
          📞 טלפון
        </a>
        {event.contactEmail && (
          <a className="event-btn secondary" href={`mailto:${event.contactEmail}`}>
            ✉️ אימייל
          </a>
        )}
        <button className="event-btn primary" onClick={() => onClose(event._id)}>
          ✅ סגרתי עסקה
        </button>
      </div>
    </div>
  )
}

function formatBudget(ev) {
  const min = ev.budgetMin
  const max = ev.budgetMax
  if (!min && !max) return 'ללא ציון'
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ₪`
  if (min) return `מ-${min.toLocaleString()} ₪`
  return `עד ${max.toLocaleString()} ₪`
}
