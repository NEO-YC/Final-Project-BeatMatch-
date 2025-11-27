// Minimal API helper for auth (register / login)
const BASE_URL = 'http://localhost:3000/user';

async function request(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};

  // רק אם זה לא FormData ואין Content-Type - נוסיף application/json
  if (!headers['Content-Type'] && !(options.body instanceof FormData) && options.skipContentType !== true) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
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

export function uploadFile(file, options = {}) {
  const fd = new FormData();
  fd.append('file', file);
  // optional save hint (e.g. 'profile' or 'gallery') — server will use it to persist URLs
  if (options.save) fd.append('save', options.save);
  return request('/upload', { method: 'POST', body: fd, skipContentType: true });
}


export default { register, login, updateMusicianProfile, getMyMusicianProfile, uploadFile };
