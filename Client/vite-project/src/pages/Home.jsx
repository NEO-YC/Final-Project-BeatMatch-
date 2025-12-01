import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchMusicians } from "../services/api";
import "./Home.css";

const Home = ({ isLoggedIn, isMusician, userName }) => {
  const navigate = useNavigate();
  const [randomMusicians, setRandomMusicians] = useState([]);
  const [allMusicians, setAllMusicians] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loadingMusicians, setLoadingMusicians] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 3;

  useEffect(() => {
    const loadRandomMusicians = async () => {
      try {
        setLoadingMusicians(true);
        const result = await searchMusicians({});
        const musiciansData = result.musicians || result.data || [];
        setAllMusicians(musiciansData);
        const shuffled = [...musiciansData].sort(() => 0.5 - Math.random());
        setRandomMusicians(shuffled.slice(0, 9));
      } catch (error) {
        console.error('Error loading musicians:', error);
      } finally {
        setLoadingMusicians(false);
      }
    };
    loadRandomMusicians();
  }, []);

  const goToSearch = () => navigate("/search");
  const goToLogin = () => navigate("/register");
  const goToMusicianSignup = () => navigate("/register");
  const goToEditProfile = () => navigate("/musician/edit");
  const goToCreateProfile = () => navigate("/musician/create");

  const handleShowAll = async () => {
    if (!allMusicians.length) {
      try {
        setLoadingMusicians(true);
        const result = await searchMusicians({});
        const musiciansData = result.musicians || result.data || [];
        setAllMusicians(musiciansData);
      } finally {
        setLoadingMusicians(false);
      }
    }
    setShowAll(true);
  };
  const handleHideAll = () => setShowAll(false);

  const nextSlide = () => {
    if (currentIndex < randomMusicians.length - cardsToShow) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderGallery = () => {
    if (loadingMusicians) {
      return (
        <div className="gallery-loading">
          <div className="spinner"></div>
          <p>טוען נגנים...</p>
        </div>
      );
    }

    if (showAll) {
      return (
        <>
          <div className="musicians-grid">
            {allMusicians.map((musician, index) => {
              const profile = musician.musicianProfile || {};
              const fullName = `${musician.firstname || ''} ${musician.lastname || ''}`.trim() || 'מוזיקאי';
              const instruments = profile.instrument ? (typeof profile.instrument === 'string' ? profile.instrument.split(',').map(i => i.trim()) : profile.instrument) : [];
              const genres = profile.musictype ? (typeof profile.musictype === 'string' ? profile.musictype.split(',').map(g => g.trim()) : profile.musictype) : [];
              const locationText = profile.location && Array.isArray(profile.location) ? profile.location.join(', ') : (profile.location || 'ישראל');

              return (
                <div key={musician._id || index} className="musician-card" onClick={() => navigate(`/musician/${musician._id}`)}>
                  <div className="musician-card-image">
                    {musician.profileImage ? (
                      <img src={musician.profileImage} alt={fullName} />
                    ) : (
                      <div className="musician-placeholder">
                        <span>🎵</span>
                      </div>
                    )}
                  </div>
                  <div className="musician-card-content">
                    <h3>{fullName}</h3>
                    <p className="musician-instruments">{instruments.length > 0 ? instruments.join(', ') : 'מוזיקאי'}</p>
                    <p className="musician-location">📍 {locationText}</p>
                    {genres.length > 0 && (
                      <div className="musician-genres">
                        {genres.slice(0, 2).map((genre, i) => (
                          <span key={i} className="genre-tag">{genre}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn secondary-btn" onClick={handleHideAll}>הצג פחות</button>
          </div>
        </>
      );
    }

    if (randomMusicians.length > 0) {
      return (
        <div className="carousel-container">
          <button
            className={`carousel-arrow carousel-arrow-right ${currentIndex === 0 ? 'disabled' : ''}`}
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            ←
          </button>

          <div className="carousel-wrapper">
            <div
              className="musicians-grid carousel"
              style={{ transform: `translateX(${currentIndex * (100 / cardsToShow)}%)` }}
            >
              {randomMusicians.map((musician, index) => {
                const profile = musician.musicianProfile || {};
                const fullName = `${musician.firstname || ''} ${musician.lastname || ''}`.trim() || 'מוזיקאי';
                const instruments = profile.instrument ? (typeof profile.instrument === 'string' ? profile.instrument.split(',').map(i => i.trim()) : profile.instrument) : [];
                const genres = profile.musictype ? (typeof profile.musictype === 'string' ? profile.musictype.split(',').map(g => g.trim()) : profile.musictype) : [];
                const locationText = profile.location && Array.isArray(profile.location) ? profile.location.join(', ') : (profile.location || 'ישראל');

                return (
                  <div key={musician._id || index} className="musician-card" onClick={() => navigate(`/musician/${musician._id}`)}>
                    <div className="musician-card-image">
                      {musician.profileImage ? (
                        <img src={musician.profileImage} alt={fullName} />
                      ) : (
                        <div className="musician-placeholder">
                          <span>🎵</span>
                        </div>
                      )}
                    </div>
                    <div className="musician-card-content">
                      <h3>{fullName}</h3>
                      <p className="musician-instruments">{instruments.length > 0 ? instruments.join(', ') : 'מוזיקאי'}</p>
                      <p className="musician-location">📍 {locationText}</p>
                      {genres.length > 0 && (
                        <div className="musician-genres">
                          {genres.slice(0, 2).map((genre, i) => (
                            <span key={i} className="genre-tag">{genre}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className={`carousel-arrow carousel-arrow-left ${currentIndex >= randomMusicians.length - cardsToShow ? 'disabled' : ''}`}
            onClick={nextSlide}
            disabled={currentIndex >= randomMusicians.length - cardsToShow}
          >
            →
          </button>
        </div>
      );
    }

    return (
      <div className="gallery-empty">
        <p>אין נגנים זמינים כרגע</p>
      </div>
    );
  };

  return (
    <div className="home">
      {/* HERO עליון */}
      <section className="home-hero">
        <div className="home-hero-text">
          <div className="hero-badge">🎵 הפלטפורמה המובילה למוזיקאים ומארגני אירועים</div>
          <h1 className="home-main-title">
            מוזיקה חיה שתהפוך
            <br />
            <span className="highlight">את האירוע שלכם</span>
            <br />
            לבלתי נשכח
          </h1>
          <p className="home-subtitle">
            BeatMatch מחברת אתכם עם מוזיקאים, זמרים והרכבים מוכשרים בישראל.
            <br />
            אלפי נגנים מקצועיים, מאות סגנונות מוזיקליים, וחיפוש חכם שמוצא בדיוק מה שאתם צריכים.
            <br />
            <strong>הפכו את האירוע הבא שלכם לחוויה מוזיקלית שלא תישכח!</strong>
          </p>

          {/* טקסט לפי מצב התחברות */}
          {isLoggedIn ? (
            isMusician ? (
              <div className="home-status-card">
                <p className="home-status-title">
                  היי {userName || "מוזיקאי"} 👋
                </p>
                <p className="home-status-text">
                  הפרופיל שלך פעיל ומוצג ללקוחות פוטנציאליים. המשך ליצור קשרים ולהגיע להזדמנויות חדשות!
                </p>
                <div className="home-musician-buttons">
                  <button className="btn primary-btn" onClick={goToEditProfile}>
                    ערוך פרופיל
                  </button>
                  <button className="btn secondary-btn" onClick={goToSearch}>
                    צפה במוזיקאים אחרים
                  </button>
                </div>
              </div>
            ) : (
              <div className="home-status-card">
                <p className="home-status-title">היי {userName || "אורח"} 👋</p>
                <p className="home-status-text">
                  מחפש מוזיקה חיה לאירוע? בוא נתחיל בחיפוש ונמצא את המוזיקאים שיתאימו לך.
                </p>
                <div className="home-musician-buttons" style={{marginTop: '20px'}}>
                  <button className="btn primary-btn" onClick={goToSearch}>
                    חפש מוזיקאים
                  </button>
                  <button className="btn secondary-btn" onClick={goToEditProfile}>
                    ערוך פרופיל
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="home-musician-cta">
              <span className="home-musician-label">🎸 מוזיקאי?</span>
              <p className="home-musician-text">
                התחבר או הירשם כדי שיכירו אותך, יצפו בקליפים שלך, יוסיפו אותך למועדפים ויזמינו אותך להופיע.
              </p>
              <div className="home-musician-buttons">
                <button className="btn primary-btn" onClick={goToLogin}>
                  התחברות
                </button>
                <button
                  className="btn secondary-btn"
                  onClick={goToMusicianSignup}
                >
                  הרשמה למוזיקאים
                </button>
              </div>
            </div>
          )}

          {/* כפתור חיפוש ראשי מוצג רק לא מחובר כדי למנוע כפילות */}
          {!isLoggedIn && (
            <div className="home-hero-buttons">
              <button className="btn hero-search-btn" onClick={goToSearch}>
                🔍 מצא מוזיקאי לאירוע
              </button>
            </div>
          )}
        </div>

        <div className="home-hero-visual">
          {/* אפשר לשים כאן תמונה / גרדיאנט / אייקון של המותג */}
          <div className="home-hero-circle">
            <span className="home-hero-note">♪</span>
          </div>
          <p className="home-hero-small">
            מוזיקאים, תזמורות, להקות קאברים, זמרים והרכבים – במקום אחד.
          </p>
        </div>
      </section>

      {/* סקשן: אודות BeatMatch */}
      <section className="home-about-section">
        <h2>אודות BeatMatch</h2>
        <p>
          BeatMatch היא פלטפורמה שמחברת בין מוזיקאים, מפיקים ומארגני אירועים. 
          המטרה שלנו היא להקל על תהליכי חיפוש, יצירת קשר ושיתופי פעולה — בחוויית שימוש נעימה, מהירה ומדויקת.
        </p>
        <p>
          כאן תוכלו למצוא ולהציג פרופילים מקצועיים, לסנן לפי סגנון, כלי נגינה, אזור ועוד, 
          כדי להגיע בדיוק לאנשים הנכונים בזמן הנכון.
        </p>
      
        
      </section>

      {/* גלריית נגנים */}
      <section className="home-musicians-gallery">
        <h2>נגנים מומלצים</h2>
        <p className="gallery-subtitle">הכירו חלק מהמוזיקאים שמחכים לכם</p>
        
        {renderGallery()}
        {!showAll && !loadingMusicians && (
          <button className="btn hero-search-btn" onClick={handleShowAll}>צפייה בכל הנגנים</button>
        )}
      </section>

      {/* יתרונות */}
      <section className="home-benefits">
        <h2>למה דווקא BeatMatch?</h2>
        <div className="home-benefits-grid">
          <div className="benefit-card">
            <h3>🎯 התאמה מדויקת</h3>
            <p>
              סינון לפי סגנון, כלי, סוג אירוע ומיקום – כדי שלא תבזבזו זמן על מוזיקאים שלא רלוונטיים.
            </p>
          </div>
          <div className="benefit-card">
            <h3>🧑‍🎤 פרופילים אמיתיים</h3>
            <p>
              לכל מוזיקאי יש תמונות, וידאו, תיאור אישי וניסיון – כך שתוכלו להרגיש את האווירה עוד לפני האירוע.
            </p>
          </div>
          <div className="benefit-card">
            <h3>⏱ חוסך חפירות</h3>
            <p>
              במקום אלף המלצות מפה לאוזן – הכול מרוכז אצלכם, במקום אחד, בצורה מסודרת ונוחה לחיפוש.
            </p>
          </div>
          <div className="benefit-card">
            <h3>🤝 קשר ישיר</h3>
            <p>
              אפשרות ליצור קשר ישירות עם המוזיקאי, לסגור פרטים ולהתאים את ההופעה בדיוק לסגנון שלכם.
            </p>
          </div>
        </div>
      </section>

      {/* איך זה עובד */}
      <section className="home-how-it-works">
        <h2>איך זה עובד?</h2>
        <div className="how-steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>מתארים את האירוע</h4>
            <p>מכניסים סוג אירוע, מיקום, תאריך וסגנון מוזיקה מועדף.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>מגלים מוזיקאים מתאימים</h4>
            <p>גוללים בין פרופילים, צופים בוידאו, קוראים תיאור ובודקים ניסיון.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>יוצרים קשר וסוגרים</h4>
            <p>מתקשרים, כותבים או מזמינים – והאירוע שלכם בדרך להיות הרבה יותר שמח.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
