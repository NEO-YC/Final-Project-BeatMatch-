// Minimal API helper for auth (register / login)
const BASE_URL = 'http://localhost:3000/user';

async function request(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
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

export default { register, login };
