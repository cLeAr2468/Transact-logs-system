import api from '../api';

/**
 * Log admin/staff activity
 * @param {string} action - Action performed (e.g., 'created', 'updated', 'viewed')
 * @param {string} module - Module name (e.g., 'transactions', 'users', 'reports')
 * @param {string} description - Human-readable description
 * @param {Object} metadata - Additional data (optional)
 * @returns {Promise} API response
 */
export const logActivity = async (action, module, description, metadata = null) => {
  try {
    console.log('📝 Attempting to log activity:', { action, module, description, metadata });
    const response = await api.post('/activity-logs', {
      action,
      module,
      description,
      metadata,
    });
    console.log('✅ Activity logged successfully:', response.data);
    return response.data;
  } catch (error) {
    // Don't throw errors for activity logging - fail silently but log details
    console.error('❌ Failed to log activity:', {
      action,
      module,
      description,
      metadata,
      error: error.response?.data || error.message,
      status: error.response?.status,
      fullError: error
    });
    return null;
  }
};

/**
 * Helper functions for common admin/staff actions
 */
export const ActivityLogger = {
  // Transaction/Appointment actions
  transactionCreated: (transactionData) =>
    logActivity('created', 'transactions', 'Created a new transaction/appointment', {
      student_id: transactionData.student_id,
      purpose: transactionData.purpose,
    }),

  transactionUpdated: (transactionId, changes) =>
    logActivity('updated', 'transactions', `Updated transaction #${transactionId}`, {
      transaction_id: transactionId,
      changes,
    }),

  transactionStatusChanged: (transactionId, oldStatus, newStatus) =>
    logActivity('status_changed', 'transactions', 
      `Changed transaction #${transactionId} status from ${oldStatus} to ${newStatus}`, {
      transaction_id: transactionId,
      old_status: oldStatus,
      new_status: newStatus,
    }),

  transactionDeleted: (transactionId) =>
    logActivity('deleted', 'transactions', `Deleted transaction #${transactionId}`, {
      transaction_id: transactionId,
    }),

  transactionViewed: () =>
    logActivity('viewed', 'transactions', 'Viewed transactions page'),

  // User management actions
  userCreated: (userData) =>
    logActivity('created', 'users', `Created user: ${userData.email}`, {
      user_id: userData.student_id,
      email: userData.email,
    }),

  userUpdated: (userId, changes) =>
    logActivity('updated', 'users', `Updated user #${userId}`, {
      user_id: userId,
      changes,
    }),

  userDeleted: (userId) =>
    logActivity('deleted', 'users', `Deleted user #${userId}`, {
      user_id: userId,
    }),

  usersViewed: () =>
    logActivity('viewed', 'users', 'Viewed users page'),

  // Staff management actions
  staffCreated: (staffData) =>
    logActivity('created', 'staff', `Created staff: ${staffData.email}`, {
      staff_id: staffData.staff_id,
      email: staffData.email,
    }),

  staffUpdated: (staffId, changes) =>
    logActivity('updated', 'staff', `Updated staff #${staffId}`, {
      staff_id: staffId,
      changes,
    }),

  staffDeleted: (staffId) =>
    logActivity('deleted', 'staff', `Deleted staff #${staffId}`, {
      staff_id: staffId,
    }),

  staffViewed: () =>
    logActivity('viewed', 'staff', 'Viewed staff page'),

  // Masterlist actions
  masterlistCreated: (studentData, addedBy) =>
    logActivity('created', 'masterlist', `Added student: ${studentData.student_id} to masterlist`, {
      student_id: studentData.student_id,
      email: studentData.email,
      added_by: addedBy, // 'admin' or 'staff'
    }),

  masterlistUploaded: (count, addedBy) =>
    logActivity('uploaded', 'masterlist', `Uploaded masterlist with ${count} students`, {
      count,
      added_by: addedBy, // 'admin' or 'staff'
    }),

  masterlistUpdated: (studentId) =>
    logActivity('updated', 'masterlist', `Updated masterlist entry for ${studentId}`, {
      student_id: studentId,
    }),

  masterlistDeleted: (studentId) =>
    logActivity('deleted', 'masterlist', `Deleted masterlist entry for ${studentId}`, {
      student_id: studentId,
    }),

  masterlistViewed: () =>
    logActivity('viewed', 'masterlist', 'Viewed masterlist page'),

  // Announcement actions
  announcementCreated: (announcementData) =>
    logActivity('created', 'announcements', `Created announcement: ${announcementData.title}`, {
      announcement_id: announcementData.id,
      title: announcementData.title,
    }),

  announcementUpdated: (announcementId, changes) =>
    logActivity('updated', 'announcements', `Updated announcement #${announcementId}`, {
      announcement_id: announcementId,
      changes,
    }),

  announcementPublished: (announcementId) =>
    logActivity('published', 'announcements', `Published announcement #${announcementId}`, {
      announcement_id: announcementId,
    }),

  announcementUnpublished: (announcementId) =>
    logActivity('unpublished', 'announcements', `Unpublished announcement #${announcementId}`, {
      announcement_id: announcementId,
    }),

  announcementDeleted: (announcementId) =>
    logActivity('deleted', 'announcements', `Deleted announcement #${announcementId}`, {
      announcement_id: announcementId,
    }),

  announcementsViewed: () =>
    logActivity('viewed', 'announcements', 'Viewed announcements page'),

  // Report actions
  reportGenerated: (reportType, params) =>
    logActivity('generated', 'reports', `Generated ${reportType} report`, {
      report_type: reportType,
      parameters: params,
    }),

  reportDownloaded: (reportType) =>
    logActivity('downloaded', 'reports', `Downloaded ${reportType} report`, {
      report_type: reportType,
    }),

  reportsViewed: () =>
    logActivity('viewed', 'reports', 'Viewed reports page'),

  reportCleared: () =>
    logActivity('cleared', 'reports', 'Cleared all generated reports'),

  // Profile actions
  profileViewed: () =>
    logActivity('viewed', 'profile', 'Viewed profile page'),

  profileUpdated: (changes) =>
    logActivity('updated', 'profile', 'Updated profile information', { changes }),

  passwordChanged: () =>
    logActivity('updated', 'profile', 'Changed account password'),

  // Dashboard actions
  dashboardViewed: () =>
    logActivity('viewed', 'dashboard', 'Viewed dashboard'),

  // Activity log actions
  activityLogsViewed: () =>
    logActivity('viewed', 'activity_logs', 'Viewed activity logs page'),

  activityLogsCleared: () =>
    logActivity('cleared', 'activity_logs', 'Cleared activity logs'),
};

export default {
  logActivity,
  ActivityLogger,
};
