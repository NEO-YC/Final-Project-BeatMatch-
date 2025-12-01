import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MusicianCard.css';

export default function MusicianCard({ musician }) {
  const navigate = useNavigate();
  const {
    _id,
    firstname,
    lastname,
    musicianProfile
  } = musician;

  // קבלת כלי נגינה
  const instruments = musicianProfile?.instrument 
    ? (Array.isArray(musicianProfile.instrument) 
        ? musicianProfile.instrument 
        : [musicianProfile.instrument])
    : [];

  // קבלת אירועים
  const eventTypes = musicianProfile?.eventTypes 
    ? (Array.isArray(musicianProfile.eventTypes) 
        ? musicianProfile.eventTypes 
        : [musicianProfile.eventTypes])
    : [];

  // קבלת מיקום
  const location = musicianProfile?.location 
    ? (Array.isArray(musicianProfile.location) 
        ? musicianProfile.location.join(', ') 
        : musicianProfile.location)
    : 'לא צויין';

  const handleClick = () => {
    navigate(`/musician/${_id}`);
  };








  return (
    <div className="musician-card" onClick={handleClick}>
      <div className="musician-card-header">
        <div className="musician-avatar">
          {musicianProfile?.profilePicture ? (
            <img src={musicianProfile.profilePicture} alt={`${firstname} ${lastname}`} />
          ) : (
            <div className="avatar-placeholder">
              {firstname?.[0]}{lastname?.[0]}
            </div>
          )}
        </div>
        <div className="musician-info">
          <h3 className="musician-name">{firstname} {lastname}</h3>
        </div>
      </div>

      <div className="musician-card-body">
        {instruments.length > 0 && (
          <div className="musician-section">
            <div className="section-label">כלי נגינה</div>
            <div className="tags">
              {instruments.map((inst, idx) => (
                <span key={idx} className="tag instrument-tag">{inst}</span>
              ))}
            </div>
          </div>
        )}

        {eventTypes.length > 0 && (
          <div className="musician-section">
            <div className="section-label">אירועים</div>
            <div className="tags">
              {eventTypes.map((ev, idx) => (
                <span key={idx} className="tag event-tag">{ev}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="musician-card-footer">
        <div className="card-location">
          <span className="location-icon">📍</span>
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}
