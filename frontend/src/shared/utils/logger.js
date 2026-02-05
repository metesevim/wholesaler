/**
 * Logger Utility
 *
 * Centralized logging utility for consistent logging across the application.
 * Can be configured to disable logs in production.
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const MAX_LOGS = 1000; // Keep last 1000 logs

/**
 * Store log to localStorage
 * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
 * @param {string} message - Log message
 * @param {*} data - Additional data
 */
const storeLog = (level, message, data = null) => {
  try {
    const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');

    const newLog = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data })
    };

    logs.push(newLog);

    // Keep only last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    localStorage.setItem('app_logs', JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to store log:', err);
  }
};

/**
 * Logs info message
 * @param {string} message - Log message
 * @param {...*} args - Additional arguments
 */
export const info = (message, ...args) => {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, ...args);
  }
  storeLog('INFO', message, args.length === 1 ? args[0] : args.length > 1 ? args : null);
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
  storeLog('WARN', message, args.length === 1 ? args[0] : args.length > 1 ? args : null);
};

/**
 * Logs error message
 * @param {string} message - Error message
 * @param {...*} args - Additional arguments
 */
export const error = (message, ...args) => {
  console.error(`[ERROR] ${message}`, ...args);
  storeLog('ERROR', message, args.length === 1 ? args[0] : args.length > 1 ? args : null);
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
  storeLog('DEBUG', message, args.length === 1 ? args[0] : args.length > 1 ? args : null);
};

const logger = {
  info,
  warn,
  error,
  debug
};

export default logger;

