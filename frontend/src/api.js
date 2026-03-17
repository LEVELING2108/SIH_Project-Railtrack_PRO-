import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Vendor APIs
export const vendorAPI = {
  getAll: (page = 1, perPage = 10) =>
    api.get(`/vendors?page=${page}&per_page=${perPage}`),
  getById: (id) =>
    api.get(`/vendors/${id}`),
  create: (data) =>
    api.post('/vendors', data),
  update: (id, data) =>
    api.put(`/vendors/${id}`, data),
  delete: (id) =>
    api.delete(`/vendors/${id}`),
  getQR: (id) =>
    api.get(`/vendors/${id}/qr`),
  downloadQR: (id) =>
    api.get(`/vendors/${id}/qr/download`, { responseType: 'blob' }),
};

// Scanner API
export const scannerAPI = {
  scan: (qrData) =>
    api.post('/scan', { qr_data: qrData }),
};

// Analytics API
export const analyticsAPI = {
  getStats: () =>
    api.get('/analytics'),
};

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  logout: () =>
    api.post('/auth/logout'),
};

// Health check
export const healthAPI = {
  check: () =>
    api.get('/health'),
};

export default api;
