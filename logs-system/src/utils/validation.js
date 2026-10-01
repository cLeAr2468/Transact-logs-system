/**
 * Validation utilities for form inputs
 */

/**
 * Password validation rules
 */
export const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Validate password complexity
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with details
 */
export const validatePassword = (password) => {
  const rules = {
    hasMinLength: password.length >= passwordRules.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password),
  };

  const isValid = Object.values(rules).every(Boolean);
  const score = Object.values(rules).filter(Boolean).length;

  let strength = "Weak";
  if (score >= 5) strength = "Strong";
  else if (score >= 4) strength = "Good";
  else if (score >= 3) strength = "Fair";

  return {
    isValid,
    score,
    strength,
    rules,
    message: isValid ? "Password meets all requirements" : "Password does not meet all requirements",
  };
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate student ID format (e.g., 21-SJ-0001)
 * @param {string} studentId - The student ID to validate
 * @returns {boolean} Whether the student ID is valid
 */
export const validateStudentId = (studentId) => {
  const studentIdRegex = /^\d{2}-[A-Z]{2}-\d{4}$/;
  return studentIdRegex.test(studentId);
};

/**
 * Sanitize and validate text input
 * @param {string} input - The input to sanitize
 * @param {Object} options - Validation options
 * @returns {Object} Sanitized value and validation result
 */
export const validateTextInput = (input, options = {}) => {
  const {
    minLength = 1,
    maxLength = 255,
    allowSpecialChars = false,
    required = true,
  } = options;

  // Trim whitespace
  const trimmed = input.trim();

  // Check required
  if (required && !trimmed) {
    return {
      isValid: false,
      value: trimmed,
      error: "This field is required",
    };
  }

  // Check length
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      value: trimmed,
      error: `Must be at least ${minLength} characters`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      value: trimmed,
      error: `Must be no more than ${maxLength} characters`,
    };
  }

  // Check for special characters (only letters, spaces, hyphens, and apostrophes allowed for names)
  if (!allowSpecialChars && !/^[a-zA-Z\s\-'\.]+$/.test(trimmed)) {
    return {
      isValid: false,
      value: trimmed,
      error: "Only letters, spaces, hyphens, and apostrophes are allowed",
    };
  }

  return {
    isValid: true,
    value: trimmed,
    error: null,
  };
};

/**
 * Auto-capitalize text (first letter of each word)
 * @param {string} text - The text to capitalize
 * @returns {string} Capitalized text
 */
export const autoCapitalize = (text) => {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

/**
 * Auto-capitalize text (first letter only - for sentence case)
 * @param {string} text - The text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeSentence = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Validate and format student ID input
 * @param {string} input - The student ID input
 * @returns {string} Formatted student ID (ALL UPPERCASE)
 */
export const formatStudentId = (input) => {
  // Simply convert to uppercase, keep all valid characters including letters
  // Allow numbers, letters, and hyphens only
  let formatted = input.toUpperCase().replace(/[^0-9A-Z-]/g, "");
  
  return formatted;
};

/**
 * Validate phone number (Philippine format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const validatePhoneNumber = (phone) => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s\-]/g, "");
  
  // Check if it matches Philippine phone format
  // Mobile: 09XX-XXX-XXXX or +639XX-XXX-XXXX
  const mobileRegex = /^(09|\+639)\d{9}$/;
  
  return mobileRegex.test(cleaned);
};

/**
 * Get detailed password error message based on validation rules
 * @param {Object} passwordValidation - Password validation result
 * @returns {string} Specific error message
 */
export const getPasswordErrorMessage = (passwordValidation) => {
  if (!passwordValidation) return "Password is required";
  
  const { rules } = passwordValidation;
  const missing = [];

  if (!rules.hasMinLength) missing.push("at least 8 characters");
  if (!rules.hasUppercase) missing.push("one uppercase letter (A-Z)");
  if (!rules.hasLowercase) missing.push("one lowercase letter (a-z)");
  if (!rules.hasNumber) missing.push("one number (0-9)");
  if (!rules.hasSpecialChar) missing.push("one special character (!@#$%^&*...)");

  if (missing.length === 0) return "";
  
  if (missing.length === 1) {
    return `Password must contain ${missing[0]}`;
  } else if (missing.length === 2) {
    return `Password must contain ${missing[0]} and ${missing[1]}`;
  } else {
    const last = missing.pop();
    return `Password must contain ${missing.join(", ")}, and ${last}`;
  }
};

/**
 * Format Staff ID to uppercase
 * @param {string} input - The staff ID input
 * @returns {string} Formatted staff ID (ALL UPPERCASE)
 */
export const formatStaffId = (input) => {
  // Convert to uppercase and remove extra spaces
  return input.toUpperCase().trim();
};

/**
 * Format any ID field to uppercase
 * @param {string} input - The ID input
 * @returns {string} Formatted ID (ALL UPPERCASE)
 */
export const formatIdField = (input) => {
  return input.toUpperCase().trim();
};

/**
 * Get password strength color
 * @param {string} strength - The strength level
 * @returns {string} Tailwind color class
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case "Strong":
      return "text-green-700 bg-green-700";
    case "Good":
      return "text-blue-600 bg-blue-600";
    case "Fair":
      return "text-yellow-600 bg-yellow-600";
    case "Weak":
    default:
      return "text-red-600 bg-red-600";
  }
};
