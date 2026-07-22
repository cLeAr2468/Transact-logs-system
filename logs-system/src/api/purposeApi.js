import api from '../api';

// ==================== PURPOSE APIs ====================

/**
 * Get all purposes (for dropdowns and admin)
 * @returns {Promise} API response with purposes list
 */
export const getAllPurposes = async () => {
  try {
    const response = await api.get('/purposes');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch purposes' };
  }
};

/**
 * Get single purpose
 * @param {number} id - Purpose ID
 * @returns {Promise} API response with purpose data
 */
export const getPurpose = async (id) => {
  try {
    const response = await api.get(`/purposes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch purpose' };
  }
};

/**
 * Create new purpose
 * @param {Object} purposeData - Purpose data {name}
 * @returns {Promise} API response
 */
export const createPurpose = async (purposeData) => {
  try {
    const response = await api.post('/purposes', purposeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create purpose' };
  }
};

/**
 * Update purpose
 * @param {number} id - Purpose ID
 * @param {Object} purposeData - Updated purpose data {name}
 * @returns {Promise} API response
 */
export const updatePurpose = async (id, purposeData) => {
  try {
    const response = await api.put(`/purposes/${id}`, purposeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update purpose' };
  }
};

/**
 * Delete purpose
 * @param {number} id - Purpose ID
 * @returns {Promise} API response
 */
export const deletePurpose = async (id) => {
  try {
    const response = await api.delete(`/purposes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete purpose' };
  }
};

export default {
  getAllPurposes,
  getPurpose,
  createPurpose,
  updatePurpose,
  deletePurpose,
};
