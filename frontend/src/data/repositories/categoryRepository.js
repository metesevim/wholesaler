/**
 * Category Repository
 *
 * Handles all category-related API calls.
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const BASE_PATH = '/categories';

/**
 * Get all categories
 * @returns {Promise<Object>} Result with categories array
 */
const getAllCategories = async () => {
  try {
    logger.info('Fetching all categories');
    const response = await httpClient.get(BASE_PATH);
    return Result.success(response.data.categories || []);
  } catch (error) {
    logger.error('Failed to fetch categories:', error);
    return Result.failure(error.message || 'Failed to fetch categories');
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data { name, description }
 * @returns {Promise<Object>} Result with created category
 */
const createCategory = async (categoryData) => {
  try {
    logger.info('Creating category:', categoryData);
    const response = await httpClient.post(BASE_PATH, categoryData);
    return Result.success(response.data.category);
  } catch (error) {
    logger.error('Failed to create category:', error);
    return Result.failure(error.message || 'Failed to create category');
  }
};

/**
 * Update a category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Result with updated category
 */
const updateCategory = async (id, categoryData) => {
  try {
    logger.info('Updating category:', id);
    const response = await httpClient.put(`${BASE_PATH}/${id}`, categoryData);
    return Result.success(response.data.category);
  } catch (error) {
    logger.error('Failed to update category:', error);
    return Result.failure(error.message || 'Failed to update category');
  }
};

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Result
 */
const deleteCategory = async (id) => {
  try {
    logger.info('Deleting category:', id);
    const response = await httpClient.delete(`${BASE_PATH}/${id}`);
    return Result.success(response.data.category);
  } catch (error) {
    logger.error('Failed to delete category:', error);
    return Result.failure(error.message || 'Failed to delete category');
  }
};

const categoryRepository = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryRepository;
