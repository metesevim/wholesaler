/**
 * Format currency with K (thousands) and M (millions) suffixes
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string with ₺ symbol
 */
export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined) return '₺0.00';

  const numValue = parseFloat(value);

  if (isNaN(numValue)) return '₺0.00';

  if (numValue >= 1000000) {
    return `₺${(numValue / 1000000).toFixed(decimals)}M`;
  } else if (numValue >= 1000) {
    return `₺${(numValue / 1000).toFixed(decimals)}K`;
  } else {
    return `₺${numValue.toFixed(decimals)}`;
  }
};

export default formatCurrency;
