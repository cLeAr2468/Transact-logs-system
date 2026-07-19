import api from '../api';

/**
 * Get current user's profile (works for both student users and admin/staff)
 * @returns {Promise} API response with user data
 */
export const getProfile = async () => {
  try {
    // Try admin/staff profile endpoint first
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // If admin or staff role, use admin profile endpoint
    if (role && ['admin', 'staff'].includes(role.toLowerCase())) {
      const response = await api.get('/admin/profile');
      console.log('✅ Admin/Staff profile loaded:', response.data);
      return response.data;
    }
    
    // Otherwise use regular profile endpoint
    const response = await api.get('/profile');
    console.log('✅ User profile loaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch profile:', error);
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

/**
 * Update current user's profile (works for both student users and admin/staff)
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} API response
 */
export const updateProfile = async (profileData) => {
  try {
    const role = localStorage.getItem('role');
    
    // If admin or staff role, use admin profile endpoint
    if (role && ['admin', 'staff'].includes(role.toLowerCase())) {
      const response = await api.put('/admin/profile', profileData);
      console.log('✅ Admin/Staff profile updated:', response.data);
      return response.data;
    }
    
    // Otherwise use regular profile endpoint
    const response = await api.put('/profile', profileData);
    console.log('✅ User profile updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

/**
 * Change user's password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} API response
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
};
