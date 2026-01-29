/**
 * Inventory Repository
 *
 * Handles all inventory-related API calls.
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const BASE_PATH = '/inventory';

/**
 * Get all admin inventory items
 * @returns {Promise<Object>} Result with items array
 */
const getAllItems = async () => {
  try {
    logger.info('Fetching all inventory items');
    const response = await httpClient.get(`${BASE_PATH}/items`);
    return Result.success(response.data.items || []);
  } catch (error) {
    logger.error('Failed to fetch inventory items:', error);
    return Result.failure(error.message || 'Failed to fetch inventory items');
  }
};

/**
 * Get inventory item by ID
 * @param {number} id - Item ID
 * @returns {Promise<Object>} Result with item data
 */
const getItemById = async (id) => {
  try {
    logger.info('Fetching inventory item:', id);
    const response = await httpClient.get(`${BASE_PATH}/items/${id}`);
    return Result.success(response.data.item);
  } catch (error) {
    logger.error('Failed to fetch inventory item:', error);
    return Result.failure(error.message || 'Failed to fetch inventory item');
  }
};

/**
 * Create a new inventory item
 * @param {Object} itemData - Item data
 * @returns {Promise<Object>} Result with created item
 */
const createItem = async (itemData) => {
  try {
    logger.info('Creating inventory item:', itemData.name);
    const response = await httpClient.post(`${BASE_PATH}/items`, itemData);
    return Result.success(response.data.item);
  } catch (error) {
    logger.error('Failed to create inventory item:', error);
    return Result.failure(error.message || 'Failed to create inventory item');
  }
};

/**
 * Update inventory item
 * @param {number} id - Item ID
 * @param {Object} itemData - Updated item data
 * @returns {Promise<Object>} Result with updated item
 */
const updateItem = async (id, itemData) => {
  try {
    logger.info('Updating inventory item:', id);
    const response = await httpClient.put(`${BASE_PATH}/items/${id}`, itemData);
    return Result.success(response.data.item);
  } catch (error) {
    logger.error('Failed to update inventory item:', error);
    return Result.failure(error.message || 'Failed to update inventory item');
  }
};

/**
 * Delete inventory item
 * @param {number} id - Item ID
 * @returns {Promise<Object>} Result
 */
const deleteItem = async (id) => {
  try {
    logger.info('Deleting inventory item:', id);
    const response = await httpClient.delete(`${BASE_PATH}/items/${id}`);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to delete inventory item:', error);
    return Result.failure(error.message || 'Failed to delete inventory item');
  }
};

/**
 * Adjust inventory quantity
 * @param {number} id - Item ID
 * @param {number} adjustment - Quantity adjustment (positive or negative)
 * @param {string} reason - Reason for adjustment
 * @returns {Promise<Object>} Result with updated item
 */
const adjustQuantity = async (id, adjustment, reason) => {
  try {
    logger.info('Adjusting inventory quantity:', id, adjustment);
    const response = await httpClient.post(`${BASE_PATH}/items/${id}/adjust`, { adjustment, reason });
    return Result.success(response.data.item);
  } catch (error) {
    logger.error('Failed to adjust inventory quantity:', error);
    return Result.failure(error.message || 'Failed to adjust inventory quantity');
  }
};

/**
 * Get inventory summary
 * @returns {Promise<Object>} Result with summary data
 */
const getSummary = async () => {
  try {
    logger.info('Fetching inventory summary');
    const response = await httpClient.get(`${BASE_PATH}/summary`);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to fetch inventory summary:', error);
    return Result.failure(error.message || 'Failed to fetch inventory summary');
  }
};

const inventoryRepository = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  adjustQuantity,
  getSummary
};

export default inventoryRepository;

