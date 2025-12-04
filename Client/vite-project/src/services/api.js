// Minimal API helper for auth (register / login)
const USER_BASE_URL = 'http://localhost:3000/user';
const EVENT_BASE_URL = 'http://localhost:3000/event';

async function request(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};

  // רק אם זה לא FormData ואין Content-Type - נוסיף application/json
  if (!headers['Content-Type'] && !(options.body instanceof FormData) && options.skipContentType !== true) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${USER_BASE_URL}${path}`, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no json */ }

  if (!res.ok) {
    // normalize error
    throw data || { message: `Request failed: ${res.status}` };
  }

  return data;
}




export function register(payload) {
  return request('/register', { method: 'POST', body: JSON.stringify(payload) });
}

export function login(payload) {
  return request('/login', { method: 'POST', body: JSON.stringify(payload) });
}
export function updateMusicianProfile(payload) {
  // אם payload הוא FormData (קבצים), לא צריך JSON.stringify
  const body = payload instanceof FormData ? payload : JSON.stringify(payload);
  const options = { 
    method: 'PUT', 
    body,
    // אם זה FormData, הדפדפן יוסיף אוטומטית Content-Type עם boundary
    skipContentType: payload instanceof FormData
  };
  
  return request('/musician/profile', options);
}

export function getMyMusicianProfile() {
  // קבלת הפרופיל של המשתמש המחובר
  return request('/me/musician-profile', { method: 'GET' });
}

export function createPayPalOrder(payload) {
  return request('/payments/create', { method: 'POST', body: JSON.stringify(payload) });
}

export function capturePayPalOrder(payload) {
  return request('/payments/capture', { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteAccount() {
  // מחיקת חשבון משתמש
  return request('/account', { method: 'DELETE' });
}

export async function uploadFile(file, options = {}) {
  // Step 1: Get signature from our server
  const signatureData = await request('/upload-signature', { method: 'GET' });
  
  // Step 2: Upload directly to Cloudinary with the signed params
  const fd = new FormData();
  fd.append('file', file);
  fd.append('timestamp', signatureData.timestamp);
  fd.append('signature', signatureData.signature);
  fd.append('api_key', signatureData.api_key);
  fd.append('folder', signatureData.folder);
  
  // Upload directly to Cloudinary
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/auto/upload`;
  const uploadRes = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: fd
  });
  
  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    throw new Error(errorData.error?.message || 'Upload failed');
  }
  
  const result = await uploadRes.json();
  
  // Step 3: If save hint provided, save the URL to the user profile
  if (options.save && result.secure_url) {
    const savePayload = {
      url: result.secure_url,
      public_id: result.public_id,
      save: options.save
    };
    await request('/upload', { 
      method: 'POST', 
      body: JSON.stringify(savePayload)
    });
  }
  
  return { url: result.secure_url, public_id: result.public_id };
}

export function searchMusicians(params = {}) {
  const queryParams = new URLSearchParams();
  
  // Handle arrays (instrument, musictype, eventTypes)
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach(v => queryParams.append(key, v));
    } else if (value) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  const path = queryString ? `/musicians/search?${queryString}` : '/musicians/search';
  return request(path);
}

export function getMusicianById(userId) {
  return request(`/musicians/${userId}`, { method: 'GET' });
}

export default { 
  register, 
  login, 
  updateMusicianProfile, 
  getMyMusicianProfile, 
  uploadFile, 
  deleteAccount, 
  searchMusicians,
  getMusicianById,
  createPayPalOrder,
  capturePayPalOrder
};

// ===== Events API (פשוט וקריא) =====
export async function createEvent(payload) {
  // רק למשתמשים רשומים: שליחת טופס אירוע חדש
  return requestAbsolute(`${EVENT_BASE_URL}/create`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// שימוש ב-helper request עבור נתיבים שדורשים טוקן
export function getOpenEvents() {
  return requestAbsolute(`${EVENT_BASE_URL}/all`, { method: 'GET' });
}

export function getMyEvents() {
  return requestAbsolute(`${EVENT_BASE_URL}/my-events`, { method: 'GET' });
}

export function getOpenEventsCount() {
  return requestAbsolute(`${EVENT_BASE_URL}/count`, { method: 'GET' });
}

export function updateEvent(eventId, payload) {
  return requestAbsolute(`${EVENT_BASE_URL}/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteEvent(eventId) {
  return requestAbsolute(`${EVENT_BASE_URL}/${eventId}`, { method: 'DELETE' });
}

export function closeEvent(eventId) {
  return requestAbsolute(`${EVENT_BASE_URL}/${eventId}/close`, { method: 'PUT' });
}

// helper קטן לקריאות מחוץ ל-USER_BASE_URL אך עם טוקן ואותו טיפול שגיאות
async function requestAbsolute(url, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!headers['Content-Type'] && !(options.body instanceof FormData) && options.skipContentType !== true) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw data || { message: `Request failed: ${res.status}` };
  return data;
}

export const eventsApi = {
  createEvent,
  getOpenEvents,
  getMyEvents,
  getOpenEventsCount,
  updateEvent,
  deleteEvent,
  closeEvent
};
