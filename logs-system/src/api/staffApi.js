import api from '../api';

// ==================== STAFF APIs ====================

/**
 * Register a new staff member
 * @param {Object} staffData - Staff details
 * @returns {Promise} API response
 */
export const registerStaff = async (staffData) => {
  try {
    const response = await api.post('/staff/register', {
      staff_id: staffData.staff_id,
      fname: staffData.fname,
      mname: staffData.mname,
      lname: staffData.lname,
      email: staffData.email,
      password: staffData.password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register staff member' };
  }
};

/**
 * Staff login
 * @param {Object} credentials - Email and password
 * @returns {Promise} API response with token
 */
export const staffLogin = async (credentials) => {
  try {
    const response = await api.post('/staff/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Staff logout
 * @returns {Promise} API response
 */
export const staffLogout = async () => {
  try {
    const response = await api.post('/staff/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Logout failed' };
  }
};

/**
 * Get all staff members
 * @returns {Promise} API response with staff list
 */
export const getAllStaff = async () => {
  try {
    const response = await api.get('/staff');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch staff members' };
  }
};

/**
 * Get a single staff member
 * @param {number} staffId - Staff ID
 * @returns {Promise} API response
 */
export const getStaff = async (staffId) => {
  try {
    const response = await api.get(`/staff/${staffId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch staff member' };
  }
};

/**
 * Update a staff member
 * @param {number} staffId - Staff ID
 * @param {Object} staffData - Updated staff details
 * @returns {Promise} API response
 */
export const updateStaff = async (staffId, staffData) => {
  try {
    const response = await api.put(`/staff/${staffId}`, staffData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update staff member' };
  }
};

/**
 * Delete a staff member
 * @param {number} staffId - Staff ID
 * @returns {Promise} API response
 */
export const deleteStaff = async (staffId) => {
  try {
    const response = await api.delete(`/staff/${staffId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete staff member' };
  }
};

export default {
  registerStaff,
  staffLogin,
  staffLogout,
  getAllStaff,
  getStaff,
  updateStaff,
  deleteStaff,
};
