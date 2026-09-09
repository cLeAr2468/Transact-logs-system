// Session Management Utility

/**
 * Set session data
 */
export const setSession = (token, userData) => {
  // Store in both localStorage and sessionStorage
  sessionStorage.setItem('admin_session', 'active');
  sessionStorage.setItem('admin_token', token);
  sessionStorage.setItem('admin_user', JSON.stringify(userData));
  
  localStorage.setItem('admin_token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token);
  
  // Store user_type from role
  if (userData && userData.role) {
    localStorage.setItem('user_type', userData.role);
    sessionStorage.setItem('user_type', userData.role);
  }
};

/**
 * Check if session is active
 */
export const isSessionActive = () => {
  const session = sessionStorage.getItem('admin_session');
  const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
  return session === 'active' && !!token;
};

/**
 * Clear session data
 */
export const clearSession = () => {
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear localStorage
  localStorage.clear();
};

/**
 * Get session token
 */
export const getSessionToken = () => {
  return sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
};

/**
 * Get session user
 */
export const getSessionUser = () => {
  const userData = sessionStorage.getItem('admin_user') || localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export default {
  setSession,
  isSessionActive,
  clearSession,
  getSessionToken,
  getSessionUser,
};
