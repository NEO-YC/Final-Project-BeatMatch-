import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MusicianProfile.css';

export default function MusicianProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [musician, setMusician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMusician() {
      try {
        const res = await fetch(`http://127.0.0.1:3000/user/musicians/${id}`);
        if (!res.ok) throw new Error('המוזיקאי לא נמצא');
        const data = await res.json();
        setMusician(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'שגיאה בטעינת הפרופיל');
      } finally {
        setLoading(false);
      }
    }
    fetchMusician();
  }, [id]);

  if (loading) {
    return (
      <div className="profile-page" dir="rtl">
        <div className="loading-state">טוען פרופיל...</div>
      </div>
    );
  }

  if (error || !musician) {
    return (
      <div className="profile-page" dir="rtl">
        <div className="error-state">
          <p>{error || 'המוזיקאי לא נמצא'}</p>
          <button onClick={() => navigate('/search')} className="btn-back">חזור לחיפוש</button>
        </div>
      </div>
    );
  }

  const user = musician.user || {};
  const { firstname, lastname, email } = user;
  const phone = musician.phone || '';
  const profile = musician.musicianProfile || {};

  const instruments = profile.instrument
    ? (Array.isArray(profile.instrument) ? profile.instrument : [profile.instrument])
    : [];

  const genres = profile.musictype
    ? (Array.isArray(profile.musictype) ? profile.musictype : [profile.musictype])
    : [];

  const eventTypes = profile.eventTypes
    ? (Array.isArray(profile.eventTypes) ? profile.eventTypes : [profile.eventTypes])
    : [];

  const location = profile.location
    ? (Array.isArray(profile.location) ? profile.location.join(', ') : profile.location)
    : 'לא צויין';

  const galleryImages = profile.galleryPictures && Array.isArray(profile.galleryPictures)
    ? profile.galleryPictures
    : [];

  const galleryVideos = profile.galleryVideos && Array.isArray(profile.galleryVideos)
    ? profile.galleryVideos
    : [];

  const youtubeLinks = profile.youtubeLinks && Array.isArray(profile.youtubeLinks)
    ? profile.youtubeLinks
    : [];

  // פונקציה לחילוץ מזהה הוידאו מ-URL של YouTube
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const whatsappLink = profile.whatsappLink || null;

  return (
    <div className="profile-page" dir="rtl">
      <button onClick={() => navigate(-1)} className="btn-back-top">← חזור</button>
      
      <div className="profile-container">
        <div className="profile-hero">
          <div className="profile-avatar-large">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={`${firstname} ${lastname}`} />
            ) : (
              <div className="avatar-placeholder-large">
                {firstname?.[0]}{lastname?.[0]}
              </div>
            )}
          </div>
          <h1 className="profile-name">{firstname} {lastname}</h1>
          <div className="profile-location-main">
            <span className="icon">📍</span>
            <span>{location}</span>
          </div>
          {profile.experienceYears && (
            <div className="profile-experience-badge">
              <span className="icon">⭐</span>
              <span>{profile.experienceYears} שנות ניסיון</span>
            </div>
          )}
        </div>

        {profile.bio && (
          <section className="profile-section bio-section">
            <h2 className="section-title">אודות</h2>
            <p className="bio-text">{profile.bio}</p>
          </section>
        )}

        <div className="profile-grid">
          {instruments.length > 0 && (
            <section className="profile-section">
              <h2 className="section-title">כלי נגינה</h2>
              <div className="tags-list">
                {instruments.map((inst, idx) => (
                  <span key={idx} className="tag instrument-tag">{inst}</span>
                ))}
              </div>
            </section>
          )}

          {genres.length > 0 && (
            <section className="profile-section">
              <h2 className="section-title">סגנון מוזיקלי</h2>
              <div className="tags-list">
                {genres.map((genre, idx) => (
                  <span key={idx} className="tag genre-tag">{genre}</span>
                ))}
              </div>
            </section>
          )}

          {eventTypes.length > 0 && (
            <section className="profile-section">
              <h2 className="section-title">אירועים</h2>
              <div className="tags-list">
                {eventTypes.map((ev, idx) => (
                  <span key={idx} className="tag event-tag">{ev}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {(galleryImages.length > 0 || galleryVideos.length > 0 || youtubeLinks.length > 0) && (
          <section className="profile-section gallery-section">
            <h2 className="section-title">גלריה</h2>
            <div className="gallery-grid">
              {galleryImages.map((img, idx) => (
                <div key={`img-${idx}`} className="gallery-item">
                  <img src={img} alt={`תמונה ${idx + 1}`} />
                </div>
              ))}
              {galleryVideos.map((vid, idx) => (
                <div key={`vid-${idx}`} className="gallery-item video-item">
                  <video controls src={vid} />
                </div>
              ))}
              {youtubeLinks.map((link, idx) => {
                const videoId = getYouTubeVideoId(link);
                if (!videoId) return null;
                return (
                  <div key={`yt-${idx}`} className="gallery-item youtube-item">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={`סרטון YouTube ${idx + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="profile-section contact-section">
          <h2 className="section-title">יצירת קשר</h2>
          <div className="contact-actions">
            {phone && (
              <a href={`tel:${phone}`} className="btn-contact phone-btn">
                <PhoneIcon /> {phone}
              </a>
            )}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact whatsapp-btn"
              >
                <WhatsappIcon /> שלח הודעה בוואטסאפ
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="btn-contact email-btn">
                <EmailIcon /> {email}
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg className="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.89.31 1.76.57 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.09a2 2 0 0 1 2.11-.45c.84.26 1.71.45 2.6.57A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg className="icon-svg" width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19.11 17.63c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.6.14-.18.27-.69.88-.84 1.06-.16.18-.31.2-.58.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.6-1.51-1.88-.16-.27-.02-.42.12-.56.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.46-.16 0-.34-.02-.52-.02-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.26 0 1.33.98 2.62 1.12 2.8.14.18 1.92 2.94 4.67 4.13.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.27.22-.63.22-1.17.15-1.28-.07-.11-.25-.18-.52-.31z" fill="currentColor"/>
      <path d="M26.88 5.11C24.1 2.34 20.45.83 16.64.83 8.91.83 2.63 7.11 2.63 14.84c0 2.48.65 4.91 1.9 7.06L2 31.17l9.49-2.48c2.09 1.14 4.45 1.74 6.86 1.74 7.73 0 14.01-6.28 14.01-14.01 0-3.74-1.46-7.26-4.24-10.03h-.24zM16.36 28.11c-2.13 0-4.2-.57-6.02-1.65l-.43-.25-5.63 1.47 1.5-5.49-.28-.45c-1.19-1.92-1.82-4.14-1.82-6.41 0-6.79 5.52-12.31 12.31-12.31 3.29 0 6.37 1.28 8.69 3.6 2.32 2.32 3.6 5.41 3.6 8.69 0 6.79-5.52 12.31-12.31 12.31z" fill="currentColor"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
