import React from "react";
import "./StaticPages.css";

export default function Contact() {
  return (
    <main className="page-wrap" dir="rtl">
      <h1 className="page-title">יצירת קשר</h1>
      <section className="page-card">
        <p className="page-text">נשמח לשמוע מכם לשאלות, הצעות ושיתופי פעולה.</p>

        <ul className="contact-list">
          <li className="contact-card">
            <div className="contact-name">נהוראי</div>
            <div className="contact-actions">
              <a className="btn-link" href="tel:0545256080" aria-label="חייג לנהוראי">
                <PhoneIcon /> 054-5256080
              </a>
              <a
                className="btn-link"
                href="https://wa.me/0545256080"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="שלח הודעת וואטסאפ לנהוראי"
              >
                <WhatsappIcon /> וואטסאפ
              </a>
            </div>
          </li>
          <li className="contact-card">
            <div className="contact-name">דניאל</div>
            <div className="contact-actions">
              <a className="btn-link" href="tel:0584240899" aria-label="חייג לדניאל">
                <PhoneIcon /> 058-4240899
              </a>
              <a
                className="btn-link"
                href="https://wa.me/0584240899"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="שלח הודעת וואטסאפ לדניאל"
              >
                <WhatsappIcon /> וואטסאפ
              </a>
            </div>
          </li>
        </ul>
      </section>
    </main>
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
