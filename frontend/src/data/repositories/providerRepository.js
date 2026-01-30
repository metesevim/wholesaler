/**
 * Provider Repository
 *
 * Handles all provider-related API calls.
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const BASE_PATH = '/providers';

/**
 * Get all providers
 * @returns {Promise<Object>} Result with providers array
 */
const getAllProviders = async () => {
  try {
    logger.info('Fetching all providers');
    const response = await httpClient.get(BASE_PATH);
    return Result.success(response.data.providers || []);
  } catch (error) {
    logger.error('Failed to fetch providers:', error);
    return Result.failure(error.message || 'Failed to fetch providers');
  }
};

/**
 * Get provider by ID
 * @param {number} id - Provider ID
 * @returns {Promise<Object>} Result with provider data
 */
const getProviderById = async (id) => {
  try {
    logger.info('Fetching provider:', id);
    const response = await httpClient.get(`${BASE_PATH}/${id}`);
    return Result.success(response.data.provider);
  } catch (error) {
    logger.error('Failed to fetch provider:', error);
    return Result.failure(error.message || 'Failed to fetch provider');
  }
};

/**
 * Create a new provider
 * @param {Object} providerData - Provider data
 * @returns {Promise<Object>} Result with created provider
 */
const createProvider = async (providerData) => {
  try {
    logger.info('Creating provider:', providerData.name);
    const response = await httpClient.post(BASE_PATH, providerData);
    return Result.success(response.data.provider);
  } catch (error) {
    logger.error('Failed to create provider:', error);
    return Result.failure(error.message || 'Failed to create provider');
  }
};

/**
 * Update provider
 * @param {number} id - Provider ID
 * @param {Object} providerData - Updated provider data
 * @returns {Promise<Object>} Result with updated provider
 */
const updateProvider = async (id, providerData) => {
  try {
    logger.info('Updating provider:', id);
    const response = await httpClient.put(`${BASE_PATH}/${id}`, providerData);
    return Result.success(response.data.provider);
  } catch (error) {
    logger.error('Failed to update provider:', error);
    return Result.failure(error.message || 'Failed to update provider');
  }
};

/**
 * Delete provider
 * @param {number} id - Provider ID
 * @returns {Promise<Object>} Result
 */
const deleteProvider = async (id) => {
  try {
    logger.info('Deleting provider:', id);
    const response = await httpClient.delete(`${BASE_PATH}/${id}`);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to delete provider:', error);
    return Result.failure(error.message || 'Failed to delete provider');
  }
};

const providerRepository = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
};

export default providerRepository;
