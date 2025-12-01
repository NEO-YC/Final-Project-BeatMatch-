import React from "react";
import "./StaticPages.css";

export default function About() {
  return (
    <main className="page-wrap" dir="rtl">
      <h1 className="page-title">אודות BeatMatch</h1>
      <section className="page-card">
        <p className="page-text">
          BeatMatch היא פלטפורמה שמחברת בין מוזיקאים, מפיקים ומארגני אירועים.
          המטרה שלנו היא להקל על תהליכי חיפוש, יצירת קשר ושיתופי פעולה — בחוויית שימוש
          נעימה, מהירה ומדויקת.
        </p>
        <p className="page-text">
          כאן תוכלו למצוא ולהציג פרופילים מקצועיים, לסנן לפי סגנון, כלי נגינה, אזור ועוד,
          כדי להגיע בדיוק לאנשים הנכונים בזמן הנכון.
        </p>
      </section>
    </main>
  );
}
