/**
 * User Mapper
 *
 * Maps user data between API format and application format.
 * Ensures consistent data structure throughout the app.
 */

import User from '../models/User';

/**
 * Maps API user response to application User model
 * @param {Object} apiUser - User data from API
 * @returns {Object} Normalized user object
 */
export const fromApi = (apiUser) => {
  if (!apiUser) return User.createEmpty();

  return User.create({
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email || null,
    name: apiUser.name,
    role: apiUser.role,
    permissions: apiUser.permissions || [],
    iban: apiUser.iban || null,
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : null
  });
};

/**
 * Maps application User model to API format
 * @param {Object} user - User object in app format
 * @returns {Object} User data in API format
 */
export const toApi = (user) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    iban: user.iban
  };
};

/**
 * Maps user data for display purposes
 * @param {Object} user - User object
 * @returns {Object} User data formatted for UI
 */
export const toDisplay = (user) => {
  return {
    ...user,
    displayName: user.name || user.username,
    roleLabel: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    createdAtFormatted: user.createdAt
      ? user.createdAt.toLocaleDateString()
      : 'N/A'
  };
};

const userMapper = {
  fromApi,
  toApi,
  toDisplay
};

export default userMapper;

