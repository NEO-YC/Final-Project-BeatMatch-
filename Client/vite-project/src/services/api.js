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

export default { register, login, updateMusicianProfile, getMyMusicianProfile, uploadFile, deleteAccount, searchMusicians };
