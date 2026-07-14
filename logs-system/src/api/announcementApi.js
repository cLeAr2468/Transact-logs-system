import api from '../api';

// ==================== ANNOUNCEMENT APIs ====================

/**
 * Get all announcements (Admin)
 * @param {Object} filters - Optional filters (status, target_audience)
 * @returns {Promise} API response with announcements list
 */
export const getAllAnnouncements = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/announcements?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch announcements' };
  }
};

/**
 * Get published announcements (Public)
 * @param {Object} filters - Optional filters (target_audience)
 * @returns {Promise} API response with published announcements
 */
export const getPublishedAnnouncements = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/public/announcements?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch published announcements' };
  }
};

/**
 * Get single announcement
 * @param {number} id - Announcement ID
 * @returns {Promise} API response with announcement data
 */
export const getAnnouncement = async (id) => {
  try {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch announcement' };
  }
};

/**
 * Create new announcement
 * @param {FormData} formData - Form data with title, content, target_audience, cover_image, status
 * @returns {Promise} API response
 */
export const createAnnouncement = async (formData) => {
  try {
    const response = await api.post('/announcements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create announcement' };
  }
};

/**
 * Update announcement
 * @param {number} id - Announcement ID
 * @param {FormData} formData - Updated form data
 * @returns {Promise} API response
 */
export const updateAnnouncement = async (id, formData) => {
  try {
    const response = await api.post(`/announcements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update announcement' };
  }
};

/**
 * Delete announcement
 * @param {number} id - Announcement ID
 * @returns {Promise} API response
 */
export const deleteAnnouncement = async (id) => {
  try {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete announcement' };
  }
};

/**
 * Publish a draft announcement
 * @param {number} id - Announcement ID
 * @returns {Promise} API response
 */
export const publishAnnouncement = async (id) => {
  try {
    const response = await api.post(`/announcements/${id}/publish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to publish announcement' };
  }
};

/**
 * Unpublish an announcement (revert to draft)
 * @param {number} id - Announcement ID
 * @returns {Promise} API response
 */
export const unpublishAnnouncement = async (id) => {
  try {
    const response = await api.post(`/announcements/${id}/unpublish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to unpublish announcement' };
  }
};

export default {
  getAllAnnouncements,
  getPublishedAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
};
