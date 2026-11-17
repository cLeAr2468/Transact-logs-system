/**
 * Get the API base URL based on the current environment
 * Automatically detects if running on localhost or production
 * @returns {string} API base URL
 */
export const getApiUrl = () => {
  const currentHost = window.location.hostname;
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // If running on production domain (Cloudflare Pages), always use Railway backend
  if (currentHost.includes('pages.dev') || currentHost.includes('transactlogs.pro')) {
    return 'https://logs-server-system-production.up.railway.app/api';
  }
  
  // If running on localhost, use local backend (or env var if set)
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return envApiUrl || 'http://127.0.0.1:8000/api';
  }
  
  // Default to Railway backend for any other domain
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
