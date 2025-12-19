/**
 * Application-wide constants
 */

export const APP_NAME = 'Wholesale Hub - Horecaline';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  PROFILE: '/profile'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

