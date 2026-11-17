import axios from "axios";

// Automatically detect environment and use correct API URL
const getApiUrl = () => {
  const currentHost = window.location.hostname;
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // If running on production domain (Cloudflare Pages), always use Railway backend
  if (currentHost.includes('pages.dev') || currentHost.includes('transactlogs.pro')) {
    console.log('🚀 Using Railway API:', 'https://logs-server-system-production.up.railway.app/api');
    return 'https://logs-server-system-production.up.railway.app/api';
  }
  
  // If running on localhost, use local backend (or env var if set)
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    const localUrl = envApiUrl || 'http://127.0.0.1:8000/api';
    console.log('💻 Using local API:', localUrl);
    return localUrl;
  }
  
  // Default to Railway backend for any other domain
  console.log('🌐 Using Railway API (default):', 'https://logs-server-system-production.up.railway.app/api');
  return 'https://logs-server-system-production.up.railway.app/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Important for CORS with credentials
});

console.log('✅ API initialized with baseURL:', api.defaults.baseURL);

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