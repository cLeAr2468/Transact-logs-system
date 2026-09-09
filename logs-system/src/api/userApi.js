import api from '../api';

// ==================== USER/CLIENT APIs ====================

/**
 * Get all users (clients)
 * @returns {Promise} API response with users list
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

/**
 * Get users statistics
 * @returns {Promise} API response with statistics
 */
export const getUserStatistics = async () => {
  try {
    const response = await api.get('/users/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch statistics' };
  }
};

/**
 * Get a single user
 * @param {number} userId - User ID
 * @returns {Promise} API response
 */
export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

/**
 * Create a new user (client account) - Admin/Staff only
 * @param {Object} userData - User details
 * @returns {Promise} API response
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create user' };
  }
};

/**
 * Update a user
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user details
 * @returns {Promise} API response
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

/**
 * Delete a user
 * @param {number} userId - User ID
 * @returns {Promise} API response
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

export default {
  getAllUsers,
  getUserStatistics,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
