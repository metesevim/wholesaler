/**
 * Logger Utility
 *
 * Centralized logging utility for consistent logging across the application.
 * Can be configured to disable logs in production.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logs info message
 * @param {string} message - Log message
 * @param {...*} args - Additional arguments
 */
export const info = (message, ...args) => {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, ...args);
  }
};

/**
 * Logs warning message
 * @param {string} message - Warning message
 * @param {...*} args - Additional arguments
 */
export const warn = (message, ...args) => {
  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, ...args);
  }
};

/**
 * Logs error message
 * @param {string} message - Error message
 * @param {...*} args - Additional arguments
 */
export const error = (message, ...args) => {
  console.error(`[ERROR] ${message}`, ...args);
};

/**
 * Logs debug message (only in development)
 * @param {string} message - Debug message
 * @param {...*} args - Additional arguments
 */
export const debug = (message, ...args) => {
  if (isDevelopment) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
};

const logger = {
  info,
  warn,
  error,
  debug
};

export default logger;

