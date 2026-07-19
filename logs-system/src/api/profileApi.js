import api from './api';

// ==================== STAFF PROFILE APIs ====================

/**
 * Get current staff's profile
 * @returns {Promise} API response with staff data
 */
export const getStaffProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

/**
 * Update current staff's profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} API response
 */
export const updateStaffProfile = async (profileData) => {
  try {
    const response = await api.put('/admin/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

/**
 * Change staff's password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} API response
 */
export const changeStaffPassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/admin/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

export default {
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
};
