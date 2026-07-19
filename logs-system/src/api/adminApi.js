import api from '../api';

// ==================== ADMIN APIs ====================

/**
 * Admin/Staff login
 * Supports:
 * 1. Default admin: admin@nwssu.edu.ph / admin
 * 2. Staff credentials from staff table
 * 
 * @param {Object} credentials - Email and password
 * @returns {Promise} API response with token
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', {
      email: credentials.email,
      password: credentials.password,
    });
    
    console.log("🔑 AdminLogin API response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ AdminLogin API error:", error.response?.data || error);
    
    // Extract error message from various possible locations
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      'Login failed';
    
    throw { message: errorMessage, ...error.response?.data };
  }
};

/**
 * Admin/Staff logout
 * @returns {Promise} API response
 */
export const adminLogout = async () => {
  try {
    const response = await api.post('/admin/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Logout failed' };
  }
};

/**
 * Get current admin/staff profile
 * @returns {Promise} API response with user data
 */
export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get profile' };
  }
};

/**
 * Forgot password - Send OTP to email
 * Works for both staff and users
 * @param {string} email - User email
 * @returns {Promise} API response
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send OTP' };
  }
};

/**
 * Verify OTP code
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} API response
 */
export const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post('/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Invalid OTP' };
  }
};

/**
 * Resend OTP code
 * @param {string} email - User email
 * @returns {Promise} API response
 */
export const resendOtp = async (email) => {
  try {
    const response = await api.post('/resend-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to resend OTP' };
  }
};

/**
 * Reset password with OTP
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP code
 * @param {string} password - New password
 * @param {string} passwordConfirmation - Password confirmation
 * @returns {Promise} API response
 */
export const resetPassword = async (email, otp, password, passwordConfirmation) => {
  try {
    const response = await api.post('/reset-password', {
      email,
      otp,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};

/**
 * Change staff password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} API response
 */
export const changeStaffPassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/admin/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      'Failed to change password';
    
    throw { message: errorMessage, ...error.response?.data };
  }
};

export default {
  adminLogin,
  adminLogout,
  getAdminProfile,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
  changeStaffPassword,
};
