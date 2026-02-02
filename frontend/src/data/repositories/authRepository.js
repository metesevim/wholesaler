/**
 * Authentication Repository
 *
 * Handles all authentication-related API calls.
 * Returns Result objects with normalized data.
 */

import httpClient from '../client/httpClient';
import { API_ENDPOINTS } from '../client/apiConfig';
import userMapper from '../../domain/mappers/userMapper';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.password - Password
 * @param {string} userData.role - Role (Admin or Employee)
 * @returns {Promise<Object>} Result with user data
 */
const register = async (userData) => {
  try {
    logger.info('Registering new user:', userData.username);

    const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);

    const { user } = response.data;

    return Result.success({
      user: userMapper.fromApi(user)
    });
  } catch (error) {
    logger.error('Registration failed:', error);
    return Result.failure(error.message || 'Registration failed. Please try again.');
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Result with token and user data
 */
const login = async (credentials) => {
  try {
    logger.info('Attempting login for user:', credentials.username);

    const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

    const { token, user } = response.data;

    return Result.success({
      token,
      user: user ? userMapper.fromApi(user) : null
    });
  } catch (error) {

    logger.error('Login failed:', error);
    return Result.failure(error.message || 'Login failed. Please try again.');
  }
};

/**
 * Logout user
 * Clears authentication state (client-side only, no backend endpoint needed)
 * @returns {Promise<Object>} Result object
 */
const logout = async () => {
  try {
    logger.info('Logging out user');
    // Backend doesn't have a logout endpoint (stateless JWT)
    // Just return success so the context can clear local state
    return Result.success(true);
  } catch (error) {
    logger.error('Logout failed:', error);
    // Still return success as logout should clear local state regardless
    return Result.success(true);
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Result with updated user data
 */
const updateProfile = async (profileData) => {
  try {
    logger.info('Updating user profile');

    const response = await httpClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData);

    const { user } = response.data;

    return Result.success({
      user: userMapper.fromApi(user)
    });
  } catch (error) {
    logger.error('Profile update failed:', error);
    return Result.failure(error.message || 'Failed to update profile. Please try again.');
  }
};

const authRepository = {
  register,
  login,
  logout,
  updateProfile
};

export default authRepository;

