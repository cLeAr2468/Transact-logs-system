import axios from 'axios';

/**
 * Notification API Module - v2.0
 * Automatically detects environment and connects to the correct backend
 * - Production (pages.dev): Railway backend
 * - Development (localhost): Local backend
 * 
 * Last updated: 2026-11-17
 */

// Automatically detect environment and use correct API URL
const getApiUrl = () => {
  const currentHost = window.location.hostname;
  
  console.log('🌐 Current hostname:', currentHost);
  
  // If running on production domain (Cloudflare Pages), always use Railway backend
  if (currentHost.includes('pages.dev') || currentHost.includes('transactlogs.pro')) {
    const railwayUrl = 'https://logs-server-system-production.up.railway.app/api';
    console.log('✅ Production detected! Using Railway API:', railwayUrl);
    return railwayUrl;
  }
  
  // If running on localhost, use local backend
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    const localUrl = 'http://127.0.0.1:8000/api';
    console.log('💻 Localhost detected! Using local API:', localUrl);
    return localUrl;
  }
  
  // Default to Railway backend for any other domain
  const railwayUrl = 'https://logs-server-system-production.up.railway.app/api';
  console.log('🔄 Unknown domain, defaulting to Railway API:', railwayUrl);
  return railwayUrl;
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

console.log('🔔 Notification API initialized!');
console.log('📍 BaseURL:', api.defaults.baseURL);
console.log('🌍 Window location:', window.location.href);

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
