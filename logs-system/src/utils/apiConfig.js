/**
 * Get the API base URL based on the current environment
 * Automatically detects if running on localhost or production
 * @returns {string} API base URL
 */
export const getApiUrl = () => {
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

/**
 * Get the storage base URL (without /api suffix) for file uploads
 * @returns {string} Storage base URL
 */
export const getStorageUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '');
};

export default {
  getApiUrl,
  getStorageUrl,
};
