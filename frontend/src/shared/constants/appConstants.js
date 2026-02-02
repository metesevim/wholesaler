/**
 * Application-wide constants
 */

export const APP_NAME = 'Wholesale Hub - Horecaline';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOMEPAGE: '/homepage',
  ORDERS: '/orders',
  ADD_ORDER: '/orders/add',
  INVENTORY: '/inventory',
  ADD_INVENTORY: '/inventory/add',
  EDIT_INVENTORY: '/inventory/:id/edit',
  CUSTOMERS: '/customers',
  ADD_CUSTOMER: '/customers/add',
  PROVIDERS: '/providers',
  ADD_PROVIDER: '/providers/add',
  ADMIN_SETTINGS: '/admin/settings',
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

