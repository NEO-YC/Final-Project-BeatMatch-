// כרטיס אירוע נקי ופשוט עם עיצוב תואם האתר
import { useState } from 'react'
import './EventCard.css'

export default function EventCard({ event, currentUserId, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    eventType: event.eventType,
    eventDate: event.eventDate.split('T')[0],
    location: event.location,
    budgetMin: event.budgetMin || '',
    budgetMax: event.budgetMax || '',
    description: event.description,
    contactName: event.contactName,
    contactPhone: event.contactPhone,
    contactEmail: event.contactEmail || ''
  })

  const dateStr = new Date(event.eventDate).toLocaleDateString('he-IL')
  const budgetStr = formatBudget(event)
  
  // בדיקה אם המשתמש המחובר הוא היוצר של האירוע
  const isOwner = currentUserId && event.createdBy && 
                  (event.createdBy._id === currentUserId || event.createdBy === currentUserId)

  const handleSaveEdit = async () => {
    await onUpdate(event._id, editData)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({
      eventType: event.eventType,
      eventDate: event.eventDate.split('T')[0],
      location: event.location,
      budgetMin: event.budgetMin || '',
      budgetMax: event.budgetMax || '',
      description: event.description,
      contactName: event.contactName,
      contactPhone: event.contactPhone,
      contactEmail: event.contactEmail || ''
    })
  }

  if (isEditing) {
    return (
      <div className="event-card editing">
        <div className="edit-form">
          <h3>עריכת אירוע</h3>
          
          <label>
            סוג אירוע
            <input 
              type="text" 
              value={editData.eventType}
              onChange={e => setEditData({...editData, eventType: e.target.value})}
            />
          </label>

          <label>
            תאריך
            <input 
              type="date" 
              value={editData.eventDate}
              onChange={e => setEditData({...editData, eventDate: e.target.value})}
            />
          </label>

          <label>
            מיקום
            <input 
              type="text" 
              value={editData.location}
              onChange={e => setEditData({...editData, location: e.target.value})}
            />
          </label>

          <label>
            תקציב מינימום
            <input 
              type="number" 
              value={editData.budgetMin}
              onChange={e => setEditData({...editData, budgetMin: e.target.value})}
            />
          </label>

          <label>
            תקציב מקסימום
            <input 
              type="number" 
              value={editData.budgetMax}
              onChange={e => setEditData({...editData, budgetMax: e.target.value})}
            />
          </label>

          <label>
            תיאור
            <textarea 
              value={editData.description}
              onChange={e => setEditData({...editData, description: e.target.value})}
              rows="4"
            />
          </label>

          <label>
            שם איש קשר
            <input 
              type="text" 
              value={editData.contactName}
              onChange={e => setEditData({...editData, contactName: e.target.value})}
            />
          </label>

          <label>
            טלפון
            <input 
              type="tel" 
              value={editData.contactPhone}
              onChange={e => setEditData({...editData, contactPhone: e.target.value})}
            />
          </label>

          <label>
            אימייל (אופציונלי)
            <input 
              type="email" 
              value={editData.contactEmail}
              onChange={e => setEditData({...editData, contactEmail: e.target.value})}
            />
          </label>

          <div className="edit-actions">
            <button className="event-btn primary" onClick={handleSaveEdit}>
              💾 שמור
            </button>
            <button className="event-btn secondary" onClick={handleCancelEdit}>
              ❌ ביטול
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="event-card">
      {/* פרטי מפרסם - קישור לדף המוזיקאי */}
      {event.createdBy && (
        <a href={`/musician/${event.createdBy._id}`} className="event-publisher-link">
          <div className="event-publisher">
            <div className="publisher-avatar">
              {event.createdBy.musicianProfile?.[0]?.profilePicture ? (
                <img src={event.createdBy.musicianProfile[0].profilePicture} alt={`${event.createdBy.firstname} ${event.createdBy.lastname}`} />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
            <div className="publisher-info">
              <div className="publisher-name">
                {event.createdBy.firstname && event.createdBy.lastname 
                  ? `${event.createdBy.firstname} ${event.createdBy.lastname}`
                  : event.createdBy.email?.split('@')[0]
                }
              </div>
              <div className="publisher-label">מפרסם האירוע</div>
            </div>
          </div>
        </a>
      )}

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
        
        {/* כפתורי עריכה ומחיקה - רק ליוצר */}
        {isOwner && (
          <>
            <button className="event-btn warning" onClick={() => setIsEditing(true)}>
              ✏️ עריכה
            </button>
            <button className="event-btn danger" onClick={() => onDelete(event._id)}>
              🗑️ מחיקה
            </button>
          </>
        )}
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
