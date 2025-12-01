import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" dir="rtl">
      <div className="footer-content simple">
        <div className="footer-bar">
          <div className="brand">BeatMatch</div>
          <nav className="footer-nav">
            <NavLink to="/about" className="footer-link">אודות</NavLink>
            <span className="dot" aria-hidden>•</span>
            <NavLink to="/contact" className="footer-link">יצירת קשר</NavLink>
          </nav>
          <div className="copy">© {year}</div>
        </div>
      </div>
    </footer>
  );
}
