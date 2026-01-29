/**
 * Storage Utility
 *
 * Wrapper around localStorage with JSON serialization and error handling.
 * Provides a consistent interface for storing application data.
 */

/**
 * Gets an item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default value
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Sets an item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} True if successful
 */
export const setItem = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Removes an item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export const removeItem = (key) => {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Clears all items from localStorage
 * @returns {boolean} True if successful
 */
export const clear = () => {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Gets auth token from storage
 * @returns {string|null} Auth token or null
 */
export const getToken = () => {
  return getItem('auth_token');
};

/**
 * Sets auth token in storage
 * @param {string} token - Auth token
 * @returns {boolean} True if successful
 */
export const setToken = (token) => {
  return setItem('auth_token', token);
};

/**
 * Removes auth token from storage
 * @returns {boolean} True if successful
 */
export const removeToken = () => {
  return removeItem('auth_token');
};

const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  getToken,
  setToken,
  removeToken
};

export default storage;

