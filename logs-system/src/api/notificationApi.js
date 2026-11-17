import axios from 'axios';

// Automatically detect environment and use correct API URL
const getApiUrl = () => {
  const currentHost = window.location.hostname;
  
  // If running on production domain (Cloudflare Pages), always use Railway backend
  if (currentHost.includes('pages.dev') || currentHost.includes('transactlogs.pro')) {
    return 'https://logs-server-system-production.up.railway.app/api';
  }
  
  // If running on localhost, use local backend
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }
  
  // Default to Railway backend for any other domain
  return 'https://logs-server-system-production.up.railway.app/api';
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

console.log('🔔 Notification API initialized with baseURL:', api.defaults.baseURL);

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getNotifications = async (page = 1, perPage = 15) => {
  const response = await api.get('/notifications', {
    params: { page, per_page: perPage }
  });
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};
