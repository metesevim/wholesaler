/**
 * Result Model
 *
 * Standardized wrapper for operation results.
 * Used throughout the application for consistent error handling.
 */

/**
 * Creates a successful result
 * @param {*} data - The success data
 * @returns {Object} Success result object
 */
const success = (data) => ({
  success: true,
  data,
  error: null
});

/**
 * Creates a failure result
 * @param {string|Error} error - The error message or Error object
 * @returns {Object} Failure result object
 */
const failure = (error) => ({
  success: false,
  data: null,
  error: typeof error === 'string' ? error : error.message || 'An error occurred'
});

const Result = {
  success,
  failure
};

export default Result;

