/**
 * User Model
 *
 * Plain JavaScript object representing a user in the system.
 * No framework dependencies - pure data structure.
 */

/**
 * Creates a User model instance
 * @param {Object} data - User data from API or other source
 * @returns {Object} Normalized user object
 */
const createUser = (data = {}) => ({
  id: data.id || null,
  username: data.username || '',
  email: data.email || null,
  name: data.name || '',
  role: data.role || 'user',
  permissions: data.permissions || [],
  iban: data.iban || null,
  createdAt: data.createdAt || null
});

/**
 * Creates an empty user object
 * @returns {Object} Empty user object
 */
const createEmptyUser = () => createUser({});

/**
 * Checks if user object is valid
 * @param {Object} user - User object to validate
 * @returns {boolean} True if user has required fields
 */
const isValidUser = (user) => {
  return user && user.id && user.username;
};

const User = {
  create: createUser,
  createEmpty: createEmptyUser,
  isValid: isValidUser
};

export default User;

