import { useState, useEffect } from 'react';
import './AuthForms.css';

const AuthForms = () => {
  // State: מצב הטופס - התחברות או הרשמה
  const [isLogin, setIsLogin] = useState(true);
  
  // State: נתוני הטופס - מכיל את כל השדות שהמשתמש ממלא
  const [formData, setFormData] = useState({
    email: '',              // אימייל המשתמש
    password: '',           // סיסמה
    confirmPassword: '',    // אימות סיסמה (רק בהרשמה)
    firstName: '',          // שם פרטי (רק בהרשמה)
    lastName: '',           // שם משפחה (רק בהרשמה)
    phone: '',              // מספר טלפון (אופציונלי)
    dateOfBirth: '',        // תאריך לידה (אופציונלי)
    acceptTerms: false,     // אישור תנאי שימוש (רק בהרשמה)
    rememberMe: false       // "זכור אותי" (רק בהתחברות)
  });

  // State: שגיאות ולידציה - מכיל הודעות שגיאה לכל שדה
  const [errors, setErrors] = useState({});
  
  // State: תצוגת סיסמאות - האם להציג את הסיסמה בטקסט רגיל
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State: חוזק סיסמה - ציון בין 0-100
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // State: מצב טעינה - האם הטופס בתהליך שליחה
  const [isLoading, setIsLoading] = useState(false);
  
  // State: הודעת הצלחה - הודעה שמוצגת לאחר הצלחה
  const [successMessage, setSuccessMessage] = useState('');
  
  // State: מודלים - האם לפתוח מודל תנאי שימוש או מדיניות פרטיות
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Effect: חישוב חוזק סיסמה בזמן אמת
  // מחשב ציון לפי אורך, אותיות גדולות/קטנות, מספרים ותווים מיוחדים
  useEffect(() => {
    if (!isLogin && formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 20;   // אורך מינימלי
      if (formData.password.length >= 12) strength += 10;  // אורך מומלץ
      if (/[a-z]/.test(formData.password)) strength += 20; // אותיות קטנות
      if (/[A-Z]/.test(formData.password)) strength += 20; // אותיות גדולות
      if (/[0-9]/.test(formData.password)) strength += 15; // מספרים
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 15; // תווים מיוחדים
      setPasswordStrength(strength);
    }
  }, [formData.password, isLogin]);

  // Function: בדיקת תקינות שדה בודד
  // מקבלת שם שדה וערך, מחזירה true אם תקין ו-false אם לא
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        // בדיקת פורמט אימייל תקין
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'אימייל הוא שדה חובה';
        } else if (!emailRegex.test(value)) {
          error = 'אנא הזן אימייל תקין';
        }
        break;

      case 'password':
        // בדיקת חוזק סיסמה - לפחות 8 תווים, אותיות גדולות/קטנות ומספרים
        if (!value) {
          error = 'סיסמה היא שדה חובה';
        } else if (value.length < 8) {
          error = 'הסיסמה חייבת להכיל לפחות 8 תווים';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) {
          error = 'הסיסמה חייבת להכיל אותיות גדולות, קטנות ומספרים';
        }
        break;

      case 'confirmPassword':
        // בדיקה שהסיסמה תואמת (רק בהרשמה)
        if (!isLogin && value !== formData.password) {
          error = 'הסיסמאות אינן תואמות';
        }
        break;

      case 'firstName':
        // בדיקת שם פרטי (רק בהרשמה)
        if (!isLogin && !value) {
          error = 'שם פרטי הוא שדה חובה';
        } else if (!isLogin && value.length < 2) {
          error = 'שם פרטי חייב להכיל לפחות 2 תווים';
        }
        break;

      case 'lastName':
        // בדיקת שם משפחה (רק בהרשמה)
        if (!isLogin && !value) {
          error = 'שם משפחה הוא שדה חובה';
        } else if (!isLogin && value.length < 2) {
          error = 'שם משפחה חייב להכיל לפחות 2 תווים';
        }
        break;

      case 'phone':
        // בדיקת פורמט טלפון ישראלי (אופציונלי)
        const phoneRegex = /^05\d{8}$/;
        if (!isLogin && value && !phoneRegex.test(value)) {
          error = 'אנא הזן מספר טלפון תקין (050-1234567)';
        }
        break;

      case 'dateOfBirth':
        // בדיקת גיל מינימלי (אופציונלי)
        if (!isLogin && value) {
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 8) {
            error = 'חייבים להיות בני 8 לפחות';
          }
        }
        break;

      case 'acceptTerms':
        // בדיקת אישור תנאי שימוש (רק בהרשמה)
        if (!isLogin && !value) {
          error = 'חובה לאשר את תנאי השימוש';
        }
        break;

      default:
        break;
    }

    // עדכון state של השגיאות
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  // Handler: טיפול בשינוי ערך בשדות הטופס
  // מתעדכן בכל הקשה ומבצע ולידציה בזמן אמת
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // checkbox מחזיר checked, שאר השדות מחזירים value
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // עדכון הערך ב-state
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // בדיקת תקינות בזמן אמת
    validateField(name, fieldValue);
  };

  // Handler: טיפול ביציאה משדה (blur)
  // מבצע ולידציה כשהמשתמש עוזב את השדה
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Function: בדיקת תקינות כל הטופס לפני שליחה
  // מחזירה true רק אם כל השדות הנדרשים תקינים
  const validateForm = () => {
    let isValid = true;
    // רשימת שדות לבדיקה - תלוי אם זה התחברות או הרשמה
    const fields = isLogin 
      ? ['email', 'password']  // התחברות: רק אימייל וסיסמה
      : ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'acceptTerms'];  // הרשמה: כל השדות

    // בדיקה של כל שדה
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Handler: טיפול בשליחת הטופס
  // מבצע ולידציה, סימולציה של קריאה לשרת, ושמירת "זכור אותי"
  const handleSubmit = async (e) => {
    e.preventDefault();  // מונע רענון דף
    
    // בדיקה שכל השדות תקינים
    if (!validateForm()) {
      return;  // עצירה אם יש שגיאות
    }

    setIsLoading(true);  // הצגת אנימציית טעינה
    setSuccessMessage('');

    // סימולציה של קריאה לשרת (2 שניות)
    // במציאות כאן תהיה קריאה ל-API
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(isLogin ? 'התחברת בהצלחה! 🎉' : 'נרשמת בהצלחה! 🎉');
      
      // שמירה או מחיקה של אימייל ב-localStorage לפי "זכור אותי"
      if (isLogin && formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // איפוס הטופס אחרי 3 שניות
      setTimeout(() => {
        setSuccessMessage('');
        resetForm();
      }, 3000);
    }, 2000);
  };

  // Function: איפוס כל שדות הטופס
  // מנקה את כל השדות, השגיאות וחוזק הסיסמה
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      acceptTerms: false
    });
    setErrors({});  // ניקוי כל השגיאות
    setPasswordStrength(0);  // איפוס חוזק סיסמה
  };

  // Function: מעבר בין מצב התחברות להרשמה
  // מחליף את המצב ומאפס את הטופס
  const toggleFormMode = () => {
    setIsLogin(!isLogin);  // היפוך המצב
    resetForm();  // ניקוי הטופס
  };

  // Function: קבלת תווית לחוזק הסיסמה
  // מחזירה טקסט בעברית לפי הציון (0-100)
  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return 'חלשה';     // 0-39
    if (passwordStrength < 70) return 'בינונית';  // 40-69
    if (passwordStrength < 90) return 'חזקה';     // 70-89
    return 'מצוינת';                              // 90-100
  };

  // Function: קבלת class CSS לחוזק הסיסמה
  // מחזירה שם class לצביעת הפס לפי חוזק הסיסמה
  const getPasswordStrengthClass = () => {
    if (passwordStrength < 40) return 'weak';      // אדום
    if (passwordStrength < 70) return 'medium';    // כתום
    if (passwordStrength < 90) return 'strong';    // כחול
    return 'excellent';                             // ירוק
  };

  // Effect: טעינת אימייל שמור בעת טעינת הקומפוננטה
  // אם המשתמש סימן "זכור אותי" בעבר, האימייל יטען אוטומטית
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      // מילוי אוטומטי של האימייל וסימון ה-checkbox
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);  // [] = רץ פעם אחת בלבד בטעינה






  


  /* ============================================
     JSX - תצוגת הטופס
     ============================================ */

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? 'התחברות' : 'הרשמה'}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'ברוך הבא! נשמח לראות אותך שוב'
              : 'צור חשבון חדש וצא למסע מרגש'}
          </p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {!isLogin && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  שם פרטי *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="הזן שם פרטי"
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  שם משפחה *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="הזן שם משפחה"
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              אימייל *
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="example@email.com"
                autoComplete="email"
              />
              <span className="input-icon">📧</span>
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {!isLogin && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  טלפון
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="050-1234567"
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">
                  תאריך לידה
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                />
                {errors.dateOfBirth && (
                  <span className="error-message">{errors.dateOfBirth}</span>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              סיסמה *
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="הזן סיסמה"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {!isLogin && (
            <>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill ${getPasswordStrengthClass()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <span className="strength-label">
                    חוזק סיסמה: {getPasswordStrengthLabel()}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  אימות סיסמה *
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="הזן סיסמה שוב"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    אני מאשר/ת את{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="link-button"
                    >
                      תנאי השימוש
                    </button>
                    {' '}ו
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPrivacyModal(true);
                      }}
                      className="link-button"
                    >
                      מדיניות הפרטיות
                    </button>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <span className="error-message">{errors.acceptTerms}</span>
                )}
              </div>
            </>
          )}

          {isLogin && (
            <div className="form-options">
              <label className="remember-me">
                <input 
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>זכור אותי</span>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              isLogin ? 'התחבר' : 'הרשם'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
            <button 
              type="button" 
              className="toggle-button"
              onClick={toggleFormMode}
            >
              {isLogin ? 'הירשם עכשיו' : 'התחבר'}
            </button>
          </p>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>תנאי השימוש</h2>
              <button className="modal-close" onClick={() => setShowTermsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <h3>1. קבלת התנאים</h3>
              <p>באמצעות הרשמה לשירות זה, אתה מסכים לתנאי השימוש המפורטים במסמך זה.</p>
              
              <h3>2. שימוש בשירות</h3>
              <p>השירות מיועד לשימוש אישי ולא מסחרי. אסור להעתיק, להפיץ או לנצל את התכנים ללא אישור מראש.</p>
              
              <h3>3. חשבון משתמש</h3>
              <p>אתה אחראי לשמירה על סודיות פרטי ההתחברות שלך. כל פעילות שתתבצע תחת חשבונך היא באחריותך המלאה.</p>
              
              <h3>4. תוכן משתמשים</h3>
              <p>אסור לפרסם תוכן פוגעני, בלתי חוקי או מפר זכויות יוצרים. אנו שומרים על הזכות להסיר תוכן כזה.</p>
              
              <h3>5. הגבלת אחריות</h3>
              <p>השירות מסופק "כמות שהוא" ללא אחריות מכל סוג. לא נישא באחריות לנזקים עקיפים או תוצאתיים.</p>
              
              <h3>6. שינויים בתנאים</h3>
              <p>אנו שומרים על הזכות לעדכן את תנאי השימוש מעת לעת. המשך השימוש לאחר השינויים מהווה הסכמה לתנאים החדשים.</p>
              
              <h3>7. סיום חשבון</h3>
              <p>אנו רשאים להשעות או לסגור חשבונות המפרים את תנאי השימוש ללא הודעה מוקדמת.</p>
              
              <p className="modal-date"><strong>עדכון אחרון:</strong> נובמבר 2025</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowTermsModal(false)}>הבנתי</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>מדיניות הפרטיות</h2>
              <button className="modal-close" onClick={() => setShowPrivacyModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <h3>1. מידע שאנו אוספים</h3>
              <p>אנו אוספים מידע אישי כגון: שם, כתובת אימייל, מספר טלפון ותאריך לידה במסגרת תהליך ההרשמה.</p>
              
              <h3>2. שימוש במידע</h3>
              <p>המידע שנאסף משמש לצורך:</p>
              <ul>
                <li>אימות זהות וניהול חשבון משתמש</li>
                <li>שיפור חווית המשתמש והתאמה אישית</li>
                <li>שליחת הודעות חשובות הקשורות לשירות</li>
                <li>אבטחת המערכת ומניעת שימוש לרעה</li>
              </ul>
              
              <h3>3. אבטחת מידע</h3>
              <p>אנו משתמשים בטכנולוגיות הצפנה מתקדמות כדי להגן על המידע האישי שלך. הסיסמאות מאוחסנות בצורה מוצפנת ולא ניתן לשחזרן.</p>
              
              <h3>4. שיתוף מידע</h3>
              <p>אנו לא משתפים את המידע האישי שלך עם צדדים שלישיים, למעט במקרים הבאים:</p>
              <ul>
                <li>כאשר נדרש על פי חוק</li>
                <li>כדי להגן על הזכויות והבטיחות שלנו ושל משתמשים אחרים</li>
                <li>עם הסכמתך המפורשת</li>
              </ul>
              
              <h3>5. עוגיות (Cookies)</h3>
              <p>אנו משתמשים בעוגיות כדי לשפר את חווית הגלישה, לזכור העדפות ולנתח שימוש באתר.</p>
              
              <h3>6. זכויות המשתמש</h3>
              <p>יש לך זכות לצפות, לעדכן או למחוק את המידע האישי שלך בכל עת. ניתן לפנות אלינו לצורך כך.</p>
              
              <h3>7. שינויים במדיניות</h3>
              <p>אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים משמעותיים יובאו לידיעתך באמצעות הודעה באתר.</p>
              
              <h3>8. יצירת קשר</h3>
              <p>לשאלות או בקשות בנוגע למדיניות הפרטיות, ניתן לפנות אלינו בכתובת: privacy@example.com</p>
              
              <p className="modal-date"><strong>עדכון אחרון:</strong> נובמבר 2025</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowPrivacyModal(false)}>הבנתי</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForms;