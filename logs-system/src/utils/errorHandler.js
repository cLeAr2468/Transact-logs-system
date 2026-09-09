/**
 * Error Handler Utility
 * Provides consistent error handling, retry mechanisms, and user-friendly messages
 */

import { toast } from "sonner";

/**
 * Extract user-friendly error message from API error
 * @param {Error} error - The error object from API call
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response) {
    if (error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    return error.message || 'An unexpected error occurred';
  }

  const { status, data } = error.response;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return data?.message || 'Invalid request. Please check your input.';
    
    case 401:
      return 'Your session has expired. Please log in again.';
    
    case 403:
      return 'You do not have permission to perform this action.';
    
    case 404:
      return data?.message || 'The requested resource was not found.';
    
    case 409:
      return data?.message || 'This action conflicts with existing data.';
    
    case 422:
      // Validation errors
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat();
        return errorMessages.join(' ');
      }
      return data?.message || 'Validation failed. Please check your input.';
    
    case 429:
      const retryAfter = data?.retry_after;
      if (retryAfter) {
        const minutes = Math.ceil(retryAfter / 60);
        return `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
      }
      return 'Too many requests. Please slow down and try again later.';
    
    case 500:
      // Handle email send failures specially
      if (data?.error === 'email_send_failed') {
        return data?.message || 'Email notification failed, but the action was completed successfully.';
      }
      return data?.message || 'A server error occurred. Please try again later.';
    
    case 503:
      return 'The service is temporarily unavailable. Please try again in a few moments.';
    
    default:
      return data?.message || data?.error || 'An error occurred. Please try again.';
  }
};

/**
 * Display error message with toast notification
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Fallback message if error parsing fails
 */
export const showErrorToast = (error, fallbackMessage = 'An error occurred') => {
  const message = getErrorMessage(error);
  
  // Handle email warnings differently (not errors)
  if (error.response?.data?.email_warning) {
    toast.warning(error.response.data.email_warning, { duration: 6000 });
    return;
  }

  // Show error toast
  toast.error(message, { duration: 5000 });
};

/**
 * Retry an async operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} - Result of the operation
 */
export const retryOperation = async (operation, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      const status = error.response?.status;
      if ([400, 401, 403, 404, 422].includes(status)) {
        throw error; // Don't retry client errors
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Handle API response with automatic success/error toast
 * @param {Promise} apiCall - The API call promise
 * @param {Object} options - Options for handling
 * @returns {Promise} - The API response data
 */
export const handleApiCall = async (apiCall, options = {}) => {
  const {
    successMessage = null,
    errorMessage = null,
    showSuccessToast = true,
    showErrorToast: showErrorToastOption = true,
    retry = false,
    maxRetries = 3
  } = options;

  try {
    const operation = async () => {
      const response = await apiCall;
      return response;
    };

    const result = retry ? await retryOperation(operation, maxRetries) : await operation();
    
    // Show success message if provided
    if (showSuccessToast && successMessage) {
      toast.success(successMessage);
    }

    return result;
  } catch (error) {
    console.error('API call failed:', error);
    
    // Show error message
    if (showErrorToastOption) {
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        showErrorToast(error);
      }
    }

    throw error;
  }
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error.response && error.message === 'Network Error';
};

/**
 * Check if error is due to rate limiting
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isRateLimitError = (error) => {
  return error.response?.status === 429;
};

/**
 * Check if error is due to authentication
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Format validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return 'Validation failed';
  }

  const messages = Object.entries(errors).map(([field, fieldErrors]) => {
    const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
    return `${field}: ${errorList.join(', ')}`;
  });

  return messages.join('\n');
};

/**
 * Get retry button text for failed operations
 * @returns {string}
 */
export const getRetryButtonText = () => {
  return '🔄 Retry';
};

/**
 * Show detailed error information (for debugging)
 * @param {Error} error - The error object
 */
export const logDetailedError = (error) => {
  console.group('🔴 API Error Details');
  console.log('Message:', getErrorMessage(error));
  console.log('Status:', error.response?.status);
  console.log('Data:', error.response?.data);
  console.log('Config:', error.config);
  console.log('Stack:', error.stack);
  console.groupEnd();
};

export default {
  getErrorMessage,
  showErrorToast,
  retryOperation,
  handleApiCall,
  isNetworkError,
  isRateLimitError,
  isAuthError,
  formatValidationErrors,
  getRetryButtonText,
  logDetailedError
};
