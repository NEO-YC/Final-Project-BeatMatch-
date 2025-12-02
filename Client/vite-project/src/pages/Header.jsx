import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import api from '../services/api'
import "./Header.css"

function Header() {
  const [user, setUser] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const loadUser = async () => {
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
        
        // Load profile picture and PRO status from database
        try {
          const profile = await api.getMyMusicianProfile()
          console.log('[Header] Profile response:', profile)
          if (profile && profile.profilePicture) {
            setProfilePicture(profile.profilePicture)
          }
          if (profile && profile.musicianProfile && profile.musicianProfile.isActive) {
            console.log('[Header] Setting isActive to TRUE')
            setIsActive(true)
          } else {
            console.log('[Header] Setting isActive to FALSE')
            setIsActive(false)
          }
        } catch (err) {
          console.log('[Header] Error loading profile:', err)
          setIsActive(false)
        }
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        setUser(null)
        setProfilePicture(null)
        setIsActive(false)
      }
    } else {
      setUser(null)
      setProfilePicture(null)
      setIsActive(false)
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

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true)
    setDeleteStep(1)
    setIsMenuOpen(false)
  }

  const confirmDelete = async () => {
    if (deleteStep === 1) {
      setDeleteStep(2)
      return
    }

    // Step 2 - actually delete
    try {
      await api.deleteAccount()
      localStorage.removeItem('token')
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('userName')
      setUser(null)
      setShowDeleteModal(false)
      setDeleteStep(1)
      window.dispatchEvent(new Event('storage'))
      navigate('/')
    } catch (error) {
      console.error('Delete error:', error)
      alert('שגיאה במחיקת החשבון: ' + (error.message || 'אנא נסה שוב'))
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteStep(1)
  }

  return (
    <div>
      <header>
        <div className="header-content">
          <div className="logo-section">
            <img src="/BMproject.png" alt="BeatMatch" className="site-logo" />
            <h1>BeatMatch</h1>
          </div>

          <div className="right-actions">
            <div className="header-links">
              <NavLink to="/search" aria-label="חיפוש" className={({isActive}) => `header-link icon${isActive ? ' active' : ''}`}>
                <svg className="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </NavLink>
              <NavLink to="/" className={({isActive}) => `header-link${isActive ? ' active' : ''}`}>דף הבית</NavLink>
            </div>

            {user ? (
              <div className="user-menu" ref={menuRef}>
                <button
                  className="user-button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="user-icon" />
                  ) : (
                    <span className="user-icon">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="user-name">
                    {user.displayName}
                    {isActive && <span className="pro-badge-header">PRO</span>}
                  </span>

                  <span className={`arrow ${isMenuOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <NavLink 
                      to="/musician/edit" 
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="menu-icon">⚙</span>
                      ערוך פרופיל
                    </NavLink>
                    <div className="menu-divider"></div>
                    <button 
                      className="menu-item logout"
                      onClick={handleLogout}
                    >
                      <span className="menu-icon">→</span>
                      התנתק
                    </button>
                    <div className="menu-divider"></div>
                    <button 
                      className="menu-item delete"
                      onClick={handleDeleteAccount}
                    >
                      <span className="menu-icon">⚠</span>
                      מחק חשבון
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="login-button">
                התחבר / הירשם
              </NavLink>
            )}
          </div>
        </div>
      </header>
      {/* Removed bottom nav; Home and Search are now in header */}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-icon-warning">⚠</div>
              <h2>{deleteStep === 1 ? 'מחיקת חשבון' : 'אישור אחרון'}</h2>
            </div>
            
            <div className="delete-modal-body">
              {deleteStep === 1 ? (
                <>
                  <p className="delete-warning-text">
                    האם אתה בטוח שברצונך למחוק את החשבון שלך?
                  </p>
                  <ul className="delete-consequences">
                    <li>כל הנתונים האישיים שלך יימחקו</li>
                    <li>פרופיל המוזיקאי שלך יוסר</li>
                    <li>כל התמונות והסרטונים יימחקו</li>
                    <li className="delete-critical">פעולה זו אינה ניתנת לביטול!</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="delete-final-warning">
                    זה הצעד האחרון. כל הנתונים שלך יימחקו לצמיתות.
                  </p>
                  <p className="delete-confirm-text">
                    לחץ על "מחק את החשבון" כדי לאשר.
                  </p>
                </>
              )}
            </div>
            
            <div className="delete-modal-footer">
              <button className="delete-cancel-btn" onClick={cancelDelete}>
                ביטול
              </button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                {deleteStep === 1 ? 'המשך' : 'מחק את החשבון'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header