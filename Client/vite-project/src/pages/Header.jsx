import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import "./Header.css"

function Header() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const loadUser = () => {
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    
    if (token) {
      try {
        const decoded = jwtDecode(token)
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

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      loadUser()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('userName')
    setUser(null)
    setIsMenuOpen(false)
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