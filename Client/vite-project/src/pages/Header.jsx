import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode'
import "./Header.css"

function Header() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // פונקציה לטעינת פרטי המשתמש
  const loadUser = () => {
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    
    if (token) {
      try {
        const decoded = jwtDecode(token)
        // אם יש שם שמור - נשתמש בו, אחרת נשתמש באימייל
        const displayName = userName || decoded.email?.split('@')[0] || 'משתמש'
        setUser({ 
          email: decoded.email, 
          userId: decoded.userId,
          displayName: displayName
        })
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  // טעינת פרטי המשתמש בטעינה ראשונה
  useEffect(() => {
    loadUser()
  }, [])

  // האזנה לשינויים ב-localStorage (כשמתחברים בטאב אחר או אחרי התחברות)
  useEffect(() => {
    const handleStorageChange = () => {
      loadUser()
    }

    // עדכון כשיש שינוי ב-localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // עדכון כשהדף מקבל פוקוס (חזרה מדף אחר)
    window.addEventListener('focus', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  // סגירת התפריט בלחיצה מחוץ לו
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // התנתקות
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('userName')
    setUser(null)
    setIsMenuOpen(false)
    
    // שליחת event לעדכון רכיבים אחרים
    window.dispatchEvent(new Event('storage'))
    
    navigate('/')
  }

  return (
    <div>
      <header>
        <div className="header-content">
          <h1>MUSIC PROJECT</h1>
          
          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button 
                className="user-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="user-icon">👤</span>
                <span className="user-name">{user.displayName}</span>
                <span className={`arrow ${isMenuOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <NavLink 
                    to="/musician/edit" 
                    className="menu-item"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="menu-icon">✏️</span>
                    ערוך פרופיל
                  </NavLink>
                  <div className="menu-divider"></div>
                  <button 
                    className="menu-item logout"
                    onClick={handleLogout}
                  >
                    <span className="menu-icon">🚪</span>
                    התנתק
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/authforms" className="login-button">
              התחבר / הירשם
            </NavLink>
          )}
        </div>
      </header>
      <nav>
        <NavLink to="/">🏠 דף הבית</NavLink>
      </nav>
    </div>
  )
}

export default Header