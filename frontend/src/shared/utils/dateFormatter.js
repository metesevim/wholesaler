/**
 * Date Formatter Utility
 *
 * Provides consistent European DD/MM/YYYY date formatting across the application
 */

/**
 * Format date to European DD/MM/YYYY format
 * @param {string|Date} dateInput - Date string or Date object
 * @param {boolean} includeTime - Whether to include time (HH:MM)
 * @returns {string} Formatted date string in DD/MM/YYYY or DD/MM/YYYY HH:MM format
 */
export const formatDateToEuropean = (dateInput, includeTime = false) => {
  if (!dateInput) return 'N/A';

  try {
    const date = new Date(dateInput);

    // Check if date is valid
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date to European DD/MM/YYYY HH:MM:SS format (full with seconds)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateTimeToEuropean = (dateInput) => {
  if (!dateInput) return 'N/A';

  try {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid Date';
  }
};

export default {
  formatDateToEuropean,
  formatDateTimeToEuropean
};
