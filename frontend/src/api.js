const TOKEN_KEY = 'workshop_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/pdf')) {
    if (!response.ok) {
      throw new Error('Download failed.');
    }
    return response.blob();
  }

  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed.');
  }

  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  getSessions: () => request('/api/sessions'),
  createSession: (body) => request('/api/sessions', { method: 'POST', body: JSON.stringify(body) }),
  updateSession: (id, body) => request(`/api/sessions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSession: (id) => request(`/api/sessions/${id}`, { method: 'DELETE' }),
  getAttendanceToken: () => request('/api/admin/attendance-token'),
  regenerateAttendanceToken: () => request('/api/admin/attendance-token/regenerate', { method: 'POST' }),
  checkIn: (token) => request('/api/attendance/check-in', { method: 'POST', body: JSON.stringify({ token }) }),
  getMyAttendance: () => request('/api/attendance/me'),
  getAdminAttendance: () => request('/api/admin/attendance'),
  getMyCertificate: () => request('/api/certificates/me'),
  downloadMyCertificate: () => request('/api/certificates/me/download'),
  getAdminCertificates: () => request('/api/admin/certificates'),
  downloadAdminCertificate: (userId) => request(`/api/admin/certificates/${userId}/download`),
  getAttendees: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/attendees${query ? `?${query}` : ''}`);
  },
  getDashboard: () => request('/api/admin/dashboard'),
  toggleSessionOpen: (id) => request(`/api/sessions/${id}/toggle-open`, { method: 'POST' }),
  sessionCheckIn: (sessionId) => request('/api/attendance/session-check-in', { method: 'POST', body: JSON.stringify({ sessionId }) }),
};

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function formatTimeRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}
