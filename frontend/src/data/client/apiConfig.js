/**
 * API Configuration
 *
 * Central configuration for API endpoints and settings
 * Based on openapi.json specification
 */

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login'
  },

  // Admin endpoints
  ADMIN: {
    CREATE_EMPLOYEE: '/admin/users',
    UPDATE_PERMISSIONS: (userId) => `/admin/users/${userId}/permissions`,
    UPDATE_USER: (userId) => `/admin/users/${userId}`
  },

  // Customer endpoints
  CUSTOMERS: {
    LIST: '/customers',
    GET: (id) => `/customers/${id}`,
    CREATE: '/customers',
    UPDATE: (id) => `/customers/${id}`,
    GET_INVENTORY: (id) => `/customers/${id}/inventory`,
    ADD_ITEMS: (id) => `/customers/${id}/inventory/items`,
    REMOVE_ITEMS: (id) => `/customers/${id}/inventory/items`
  },

  // Inventory endpoints
  INVENTORY: {
    LIST: '/inventory/items',
    GET: (id) => `/inventory/items/${id}`,
    CREATE: '/inventory/items',
    UPDATE: (id) => `/inventory/items/${id}`,
    DELETE: (id) => `/inventory/items/${id}`,
    ADJUST: (id) => `/inventory/items/${id}/adjust`,
    SUMMARY: '/inventory/summary'
  },

  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    GET: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    ADD_ITEM: (id) => `/orders/${id}/items`,
    CUSTOMER_ORDERS: (customerId) => `/orders/customer/${customerId}`,
    AVAILABLE_ITEMS: (customerId) => `/orders/customer/${customerId}/available-items`,
    SUMMARY: '/orders/summary'
  },

  // Health check
  HEALTH: '/health'
};

export default API_CONFIG;

