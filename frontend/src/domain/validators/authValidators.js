/**
 * Authentication Validators
 *
 * Pure validation functions for authentication-related data.
 * No side effects, no dependencies.
 */

import { VALIDATION_ERRORS } from '../constants/authConstants';

/**
 * Validates login credentials
 * @param {Object} credentials - Credentials to validate
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - Password
 * @returns {Object} Validation result with isValid flag and errors object
 */
export const validateLoginCredentials = (credentials) => {
  const errors = {};

  // Username validation
  if (!credentials.username || credentials.username.trim() === '') {
    errors.username = VALIDATION_ERRORS.USERNAME_REQUIRED;
  }

  // Password validation
  if (!credentials.password) {
    errors.password = VALIDATION_ERRORS.PASSWORD_REQUIRED;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
export const isValidUsername = (username) => {
  if (!username || username.trim() === '') return false;
  return username.length >= 3 && username.length <= 50;
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength level
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return { isValid: false, strength: 'none' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 'weak';
  let score = 0;

  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumbers) score++;
  if (hasSpecialChar) score++;

  if (score >= 3) strength = 'strong';
  else if (score >= 2) strength = 'medium';

  return {
    isValid: true,
    strength,
    score,
    requirements: {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

