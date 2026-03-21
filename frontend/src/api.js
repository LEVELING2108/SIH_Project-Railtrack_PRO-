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
  // Only set auth header if not already present.
  if (token && (!config.headers || !config.headers.Authorization)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh flow: if the access token expires (401), use the refresh token
// to obtain a new access token, then retry the original request once.
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await refreshApi.post(
        '/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      const newAccessToken = response?.data?.access_token;
      if (!newAccessToken) return null;

      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (e) {
      // Refresh failed: force logout.
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

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

// Vendor Performance API
export const performanceAPI = {
  getVendorPerformance: () =>
    api.get('/vendors/performance'),
  seedData: () =>
    api.post('/seed'),
};

// Track Items API (Railway Track Fittings)
export const trackItemsAPI = {
  getAll: (page = 1, perPage = 10, filters = {}) => {
    let url = `/track-items?page=${page}&per_page=${perPage}`;
    if (filters.item_type) url += `&item_type=${filters.item_type}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.vendor_id) url += `&vendor_id=${filters.vendor_id}`;
    return api.get(url);
  },
  getById: (id) =>
    api.get(`/track-items/${id}`),
  create: (data) =>
    api.post('/track-items', data),
  update: (id, data) =>
    api.put(`/track-items/${id}`, data),
  delete: (id) =>
    api.delete(`/track-items/${id}`),
  getQR: (id) =>
    api.get(`/track-items/${id}/qr`),
  scan: (qrData) =>
    api.post('/scan-track-item', { qr_data: qrData }),
  getAnalytics: () =>
    api.get('/track-items/analytics'),
  getExceptions: () =>
    api.get('/track-items/exceptions'),
};

// Inspections API
export const inspectionsAPI = {
  getByItemId: (itemId) =>
    api.get(`/track-items/${itemId}/inspections`),
  create: (itemId, data) =>
    api.post(`/track-items/${itemId}/inspections`, data),
};

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  refresh: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token available'));
    }
    return refreshApi.post(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    );
  },
  logout: () =>
    api.post('/auth/logout'),
};

// Health check
export const healthAPI = {
  check: () =>
    api.get('/health'),
};

export default api;
