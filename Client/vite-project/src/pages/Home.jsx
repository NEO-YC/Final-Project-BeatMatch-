import React, { useState, useEffect, useMemo } from 'react';
import './Home.css';

// דף חיפוש מוזיקאים חכם ונוח
// - תגיות (chips)
// - בחירה מרובת אפשרויות ל-instrument / musictype / eventTypes
// - שדה מיקום חופשי
// - מציג תוצאות מה-API /user/musicians/search

const SUGGESTED_INSTRUMENTS = [
  "גיטרה אקוסטית",
  "גיטרה חשמלית",
  "גיטרה בס",
  "פסנתר",
  "קלידים / אורגן",
  "כינור",
  "תופים",
  "דרבוקה",
  "קחון",
  "טמבורין",
  "בונגו",
  "קונגה",
  "תופי מרים",
  "סקסופון",
  "קלרינט",
  "חצוצרה",
  "טרומבון",
  "חליל צד",
  "חליל ערבי (ניי)",
  "עוד",
  "בוזוקי",
  "קאנון",
  "די.ג'יי",
];
const SUGGESTED_GENRES = [
  'ישראלי','ים תיכוני','עממי','פיוטים','מזרחי','דתי לאומי','ליטאי','חסידי'
];
const SUGGESTED_EVENTS = [
  'חתונה',
  'בר מצווה',
  'שבת חתן',
  'ברית',
  'אירוע אירוסין',
  'יום הולדת',
  'חינה',
  'אירוע משפחתי',
  'אירוע חברה',
  'טקס / כנס',
  'מופע קהילתי',
  'קבלת פנים',
  'חפלה',
  'שירה בציבור',
  'הופעה חיה'
];

export default function Home(){
  console.log("test branch");
  
  const [query, setQuery] = useState(''); // חיפוש חופשי (מחפש גם ב-location)

  const [instrumentInput, setInstrumentInput] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [eventInput, setEventInput] = useState('');
  // region: North / Center / South - matches server-side simplified regions
  const [locationInput, setLocationInput] = useState('');
  const [region, setRegion] = useState('');

  const [instruments, setInstruments] = useState([]);
  const [genres, setGenres] = useState([]);
  const [events, setEvents] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // suggestions filtered
  const instrumentSuggestions = useMemo(()=>
    SUGGESTED_INSTRUMENTS.filter(i=> i.toLowerCase().includes(instrumentInput.toLowerCase()) && !instruments.includes(i))
  ,[instrumentInput, instruments]);

  const genreSuggestions = useMemo(()=>
    SUGGESTED_GENRES.filter(g=> g.toLowerCase().includes(genreInput.toLowerCase()) && !genres.includes(g))
  ,[genreInput, genres]);

  const eventSuggestions = useMemo(()=>
    SUGGESTED_EVENTS.filter(e=> e.toLowerCase().includes(eventInput.toLowerCase()) && !events.includes(e))
  ,[eventInput, events]);

  // הוספת תגית על-ידי לחיצה או לחצן Enter
  function addTag(listSetter, value){
    if(!value) return;
    listSetter(prev=> (prev.includes(value) ? prev : [...prev, value]));
  }

  function removeTag(listSetter, value){
    listSetter(prev=> prev.filter(v=> v !== value));
  }

  // בניית שאילתה ושיגור בקשת חיפוש לשרת
  async function doSearch(e){
    if(e && e.preventDefault) e.preventDefault();
    setLoading(true); setError(null);
    try{
      const params = new URLSearchParams();
      if (instruments.length) instruments.forEach(i => params.append('instrument', i));
      if (genres.length) genres.forEach(g => params.append('musictype', g));
      if (events.length) events.forEach(ev => params.append('eventTypes', ev));
      // prefer region if selected (north/center/south), otherwise use free-text location
      if (region) params.append('region', region);
      else if (locationInput) params.append('location', locationInput);
      if (query) params.append('q', query);

      const url = '/user/musicians/search?' + params.toString();
      const res = await fetch(url);
      if(!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.musicians || []);
    }catch(err){
      console.error(err);
      setError(err.message || 'Search failed');
    }finally{
      setLoading(false);
    }
  }

  // חיפוש ראשוני או דיפולטיבי
  useEffect(()=>{
    // לבצע חיפוש ראשון קל כאשר הדף נטען
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="home-page">
      <section className="search-panel">
        <h2>מצא מוזיקאים</h2>
        <form className="search-form" onSubmit={doSearch}>
          <div className="row">
            <input 
              className="input-large"
              placeholder="חפש (שם/תיאור)..."
              value={query}
              onChange={e=> setQuery(e.target.value)}
            />

            <div className="region-select">
              <select className="input-medium" value={region} onChange={e=> setRegion(e.target.value)}>
                <option value="">כל הארץ</option>
                <option value="north">צפון</option>
                <option value="center">מרכז</option>
                <option value="south">דרום</option>
              </select>
            </div>

            <button className="btn-primary" type="submit">חפש</button>
          </div>

          <div className="filters-summary">
            <div className="summary-left">
              {instruments.length > 0 && <div className="mini">כלים: {instruments.join(', ')}</div>}
              {genres.length > 0 && <div className="mini">סגנונות: {genres.join(', ')}</div>}
              {events.length > 0 && <div className="mini">אירועים: {events.join(', ')}</div>}
              {region && <div className="mini">אזור: {region === 'north' ? 'צפון' : region === 'center' ? 'מרכז' : 'דרום'}</div>}
            </div>
            <div className="summary-right">
              <button type="button" className="btn-link" onClick={()=> setFiltersOpen(prev=> !prev)}>{filtersOpen ? 'הסתר פילטרים' : 'הצג פילטרים'}</button>
            </div>
          </div>

          <div className={`filters ${filtersOpen ? 'open' : 'closed'}`}>
            <div className="filter-block">
              <label>כלי נגינה</label>
              <div className="tag-input">
                <input
                  placeholder="הוסף כלי" 
                  value={instrumentInput}
                  onChange={e=> setInstrumentInput(e.target.value)}
                  onKeyDown={e=> {
                    if(e.key === 'Enter'){ e.preventDefault(); addTag(setInstruments, instrumentInput.trim()); setInstrumentInput(''); }
                  }}
                />
                <div className="suggestions">
                  {instrumentSuggestions.map(s=> (
                    <button key={s} type="button" className="suggestion" onClick={()=>{ addTag(setInstruments,s); setInstrumentInput(''); }}>{s}</button>
                  ))}
                </div>
                <div className="chips">
                  {instruments.map(i=> (
                    <span className="chip" key={i}>{i} <button onClick={()=> removeTag(setInstruments,i)}>×</button></span>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-block">
              <label>סגנון מוזיקלי</label>
              <div className="tag-input">
                <input
                  placeholder="הוסף סגנון"
                  value={genreInput}
                  onChange={e=> setGenreInput(e.target.value)}
                  onKeyDown={e=> { if(e.key === 'Enter'){ e.preventDefault(); addTag(setGenres, genreInput.trim()); setGenreInput(''); } }}
                />
                <div className="suggestions">
                  {genreSuggestions.map(s=> (
                    <button key={s} type="button" className="suggestion" onClick={()=>{ addTag(setGenres,s); setGenreInput(''); }}>{s}</button>
                  ))}
                </div>
                <div className="chips">
                  {genres.map(g=> (
                    <span className="chip" key={g}>{g} <button onClick={()=> removeTag(setGenres,g)}>×</button></span>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-block">
              <label>סוגי אירועים</label>
              <div className="tag-input">
                <input
                  placeholder="הוסף סוג אירוע"
                  value={eventInput}
                  onChange={e=> setEventInput(e.target.value)}
                  onKeyDown={e=> { if(e.key === 'Enter'){ e.preventDefault(); addTag(setEvents, eventInput.trim()); setEventInput(''); } }}
                />
                <div className="suggestions">
                  {eventSuggestions.map(s=> (
                    <button key={s} type="button" className="suggestion" onClick={()=>{ addTag(setEvents,s); setEventInput(''); }}>{s}</button>
                  ))}
                </div>
                <div className="chips">
                  {events.map(ev=> (
                    <span className="chip" key={ev}>{ev} <button onClick={()=> removeTag(setEvents,ev)}>×</button></span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </form>
      </section>

      <section className="results">
        <div className="results-header">
          <h3>תוצאות</h3>
          <div className="meta">{loading ? 'טוען...' : `${results.length} תוצאות`}</div>
        </div>

        {error && <div className="error">אירעה שגיאה בחיפוש. נסה שוב מאוחר יותר.</div>}

        {!loading && results.length === 0 && !error && (
          <div className="empty">לא נמצאו מוזיקאים לפי הקריטריונים — נסה הרחבה או הסר פילטרים</div>
        )}

        <div className="cards">
          {results.map(r=> (
            <div className="card" key={r._id}>
              <div className="card-left">
                <div className="avatar">{r.firstname ? r.firstname[0] : 'M'}</div>
              </div>
              <div className="card-body">
                <div className="card-title">{r.firstname} {r.lastname}</div>
                <div className="card-sub">{r.musicianProfile ? (r.musicianProfile.instrument || r.musicianProfile.musictype) : ''}</div>
                <div className="card-text">{r.musicianProfile && r.musicianProfile.bio ? r.musicianProfile.bio : 'תיאור לא זמין'}</div>
                <div className="card-footer">
                  <small>אזור: {r.musicianProfile && r.musicianProfile.location ? (Array.isArray(r.musicianProfile.location) ? r.musicianProfile.location.join(', ') : r.musicianProfile.location) : 'לא צויין'}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
