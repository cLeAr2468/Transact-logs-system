import axios from "axios";

// Automatically detect environment and use correct API URL
const getApiUrl = () => {
  // If VITE_API_URL is set, use it (for production builds)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current domain
  const currentHost = window.location.hostname;
  
  // If running on localhost, use local backend
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }
  
  // If running on Cloudflare Pages, use Railway backend
  if (currentHost.includes('pages.dev') || currentHost.includes('transactlogs.pro')) {
    return 'https://logs-server-system-production.up.railway.app/api';
  }
  
  // Default to Railway backend
  return 'https://logs-server-system-production.up.railway.app/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Important for CORS with credentials
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Check for admin token first, then fall back to regular token
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear tokens and redirect to login
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;