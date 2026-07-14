import api from '../api';

// ==================== MASTERLIST APIs ====================

/**
 * Get all masterlist entries
 * @returns {Promise} API response with masterlist
 */
export const getAllMasterlist = async () => {
  try {
    const response = await api.get('/masterlist');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch masterlist' };
  }
};

/**
 * Get masterlist statistics
 * @returns {Promise} API response with statistics
 */
export const getMasterlistStatistics = async () => {
  try {
    const response = await api.get('/masterlist/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch statistics' };
  }
};

/**
 * Get a single masterlist entry
 * @param {number} id - Masterlist entry ID
 * @returns {Promise} API response
 */
export const getMasterlistEntry = async (id) => {
  try {
    const response = await api.get(`/masterlist/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch masterlist entry' };
  }
};

/**
 * Create a new masterlist entry
 * @param {Object} data - Masterlist entry data
 * @returns {Promise} API response
 */
export const createMasterlistEntry = async (data) => {
  try {
    const response = await api.post('/masterlist', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create masterlist entry' };
  }
};

/**
 * Update a masterlist entry
 * @param {number} id - Masterlist entry ID
 * @param {Object} data - Updated masterlist entry data
 * @returns {Promise} API response
 */
export const updateMasterlistEntry = async (id, data) => {
  try {
    const response = await api.put(`/masterlist/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update masterlist entry' };
  }
};

/**
 * Delete a masterlist entry
 * @param {number} id - Masterlist entry ID
 * @returns {Promise} API response
 */
export const deleteMasterlistEntry = async (id) => {
  try {
    const response = await api.delete(`/masterlist/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete masterlist entry' };
  }
};

/**
 * Import masterlist from CSV file
 * @param {FormData} formData - FormData containing the CSV file
 * @returns {Promise} API response
 */
export const importMasterlistCSV = async (formData) => {
  try {
    const response = await api.post('/masterlist/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to import CSV file' };
  }
};

export default {
  getAllMasterlist,
  getMasterlistStatistics,
  getMasterlistEntry,
  createMasterlistEntry,
  updateMasterlistEntry,
  deleteMasterlistEntry,
  importMasterlistCSV,
};
