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
    console.log('🔐 Admin login attempt:', { 
      email: credentials.email,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.post('/admin/login', {
      email: credentials.email.trim(),
      password: credentials.password,
    });
    
    console.log("✅ AdminLogin successful:", {
      hasToken: !!response.data.token,
      hasUser: !!response.data.user || !!response.data.admin,
      role: response.data.role || response.data.user?.role
    });
    
    return response.data;
  } catch (error) {
    console.error("❌ AdminLogin error:", {
      name: error.name,
      message: error.message,
      hasResponse: !!error.response,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Extract meaningful error message
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response) {
      const { status, data } = error.response;
      
      console.log('📥 Server response:', { status, data });
      
      if (status === 401) {
        errorMessage = data?.message || 'Invalid email or password';
      } else if (status === 403) {
        errorMessage = 'Access denied. This account does not have admin/staff privileges.';
      } else if (status === 422) {
        // Validation error
        if (data?.errors) {
          const firstError = Object.values(data.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
          errorMessage = data?.message || 'Validation failed';
        }
      } else if (status === 429) {
        errorMessage = data?.message || 'Too many login attempts. Please try again later.';
      } else if (status >= 500) {
        // Show actual server error in development
        errorMessage = data?.message || data?.error || 'Server error. Please contact support.';
        console.error('🚨 Server Error Details:', data);
      } else {
        errorMessage = data?.message || data?.error || errorMessage;
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('❌ No response from server');
      throw new Error('Cannot connect to server. Please check your internet connection.');
    } else {
      console.error('❌ Request setup error:', error.message);
      throw new Error(error.message || errorMessage);
    }
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
