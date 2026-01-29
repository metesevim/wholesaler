/**
 * Admin Repository
 *
 * Handles all admin-related API calls.
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const BASE_PATH = '/admin';

/**
 * Create a new employee
 * @param {Object} employeeData - Employee data (username, password, permissions, iban)
 * @returns {Promise<Object>} Result with created user
 */
const createEmployee = async (employeeData) => {
  try {
    logger.info('Creating employee:', employeeData.username);
    const response = await httpClient.post(`${BASE_PATH}/users`, employeeData);
    return Result.success(response.data.user);
  } catch (error) {
    logger.error('Failed to create employee:', error);
    return Result.failure(error.message || 'Failed to create employee');
  }
};

/**
 * Update user permissions
 * @param {number} userId - User ID
 * @param {Array<string>} permissions - Array of permission strings
 * @returns {Promise<Object>} Result with updated user
 */
const updateUserPermissions = async (userId, permissions) => {
  try {
    logger.info('Updating user permissions:', userId);
    const response = await httpClient.put(`${BASE_PATH}/users/${userId}/permissions`, { permissions });
    return Result.success(response.data.user);
  } catch (error) {
    logger.error('Failed to update user permissions:', error);
    return Result.failure(error.message || 'Failed to update user permissions');
  }
};

/**
 * Update user information
 * @param {number} userId - User ID
 * @param {Object} userData - User data (username, password, iban)
 * @returns {Promise<Object>} Result with updated user
 */
const updateUser = async (userId, userData) => {
  try {
    logger.info('Updating user:', userId);
    const response = await httpClient.put(`${BASE_PATH}/users/${userId}`, userData);
    return Result.success(response.data.user);
  } catch (error) {
    logger.error('Failed to update user:', error);
    return Result.failure(error.message || 'Failed to update user');
  }
};

const adminRepository = {
  createEmployee,
  updateUserPermissions,
  updateUser
};

export default adminRepository;

