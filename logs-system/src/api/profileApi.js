import api from '../api';

/**
 * Get current user's profile
 * @returns {Promise} API response with user data
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

/**
 * Update current user's profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} API response
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
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
