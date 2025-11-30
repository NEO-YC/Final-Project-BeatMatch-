import React from 'react';
import './MusicianCard.css';

export default function MusicianCard({ musician }) {
  const {
    _id,
    firstname,
    lastname,
    musicianProfile,
    phone
  } = musician;

  // בניית קישור WhatsApp
  const getWhatsAppLink = () => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`היי ${firstname}, ראיתי את הפרופיל שלך ב-BeatMatch!`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // קבלת כלי נגינה
  const instruments = musicianProfile?.instrument 
    ? (Array.isArray(musicianProfile.instrument) 
        ? musicianProfile.instrument 
        : [musicianProfile.instrument])
    : [];

  // קבלת ז'אנרים
  const genres = musicianProfile?.musictype 
    ? (Array.isArray(musicianProfile.musictype) 
        ? musicianProfile.musictype 
        : [musicianProfile.musictype])
    : [];

  // קבלת מיקום
  const location = musicianProfile?.location 
    ? (Array.isArray(musicianProfile.location) 
        ? musicianProfile.location.join(', ') 
        : musicianProfile.location)
    : 'לא צויין';

  return (
    <div className="musician-card">
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
          <div className="musician-location">
            <span className="location-icon">📍</span>
            {location}
          </div>
        </div>
      </div>

      <div className="musician-card-body">
        {instruments.length > 0 && (
          <div className="musician-section">
            <div className="section-label">כלי נגינה:</div>
            <div className="tags">
              {instruments.map((inst, idx) => (
                <span key={idx} className="tag instrument-tag">🎸 {inst}</span>
              ))}
            </div>
          </div>
        )}

        {genres.length > 0 && (
          <div className="musician-section">
            <div className="section-label">סגנון מוזיקלי:</div>
            <div className="tags">
              {genres.map((genre, idx) => (
                <span key={idx} className="tag genre-tag">🎵 {genre}</span>
              ))}
            </div>
          </div>
        )}

        {musicianProfile?.bio && (
          <div className="musician-section">
            <div className="section-label">אודות:</div>
            <p className="musician-bio">{musicianProfile.bio}</p>
          </div>
        )}
      </div>

      <div className="musician-card-footer">
        {phone && (
          <a 
            href={getWhatsAppLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <span className="whatsapp-icon">💬</span>
            צור קשר בוואטסאפ
          </a>
        )}
      </div>
    </div>
  );
}
