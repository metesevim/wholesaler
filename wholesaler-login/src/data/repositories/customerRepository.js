/**
 * Customer Repository
 *
 * Handles all customer-related API calls.
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const BASE_PATH = '/customers';

/**
 * Get all customers
 * @returns {Promise<Object>} Result with customers array
 */
const getAllCustomers = async () => {
  try {
    logger.info('Fetching all customers');
    const response = await httpClient.get(BASE_PATH);
    return Result.success(response.data.customers || []);
  } catch (error) {
    logger.error('Failed to fetch customers:', error);
    return Result.failure(error.message || 'Failed to fetch customers');
  }
};

/**
 * Get customer by ID
 * @param {number} id - Customer ID
 * @returns {Promise<Object>} Result with customer data
 */
const getCustomerById = async (id) => {
  try {
    logger.info('Fetching customer:', id);
    const response = await httpClient.get(`${BASE_PATH}/${id}`);
    return Result.success(response.data.customer);
  } catch (error) {
    logger.error('Failed to fetch customer:', error);
    return Result.failure(error.message || 'Failed to fetch customer');
  }
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} Result with created customer
 */
const createCustomer = async (customerData) => {
  try {
    logger.info('Creating customer:', customerData.name);
    const response = await httpClient.post(BASE_PATH, customerData);
    return Result.success(response.data.customer);
  } catch (error) {
    logger.error('Failed to create customer:', error);
    return Result.failure(error.message || 'Failed to create customer');
  }
};

/**
 * Update customer
 * @param {number} id - Customer ID
 * @param {Object} customerData - Updated customer data
 * @returns {Promise<Object>} Result with updated customer
 */
const updateCustomer = async (id, customerData) => {
  try {
    logger.info('Updating customer:', id);
    const response = await httpClient.put(`${BASE_PATH}/${id}`, customerData);
    return Result.success(response.data.customer);
  } catch (error) {
    logger.error('Failed to update customer:', error);
    return Result.failure(error.message || 'Failed to update customer');
  }
};

/**
 * Get customer inventory
 * @param {number} id - Customer ID
 * @returns {Promise<Object>} Result with inventory items
 */
const getCustomerInventory = async (id) => {
  try {
    logger.info('Fetching customer inventory:', id);
    const response = await httpClient.get(`${BASE_PATH}/${id}/inventory`);
    return Result.success(response.data.items || []);
  } catch (error) {
    logger.error('Failed to fetch customer inventory:', error);
    return Result.failure(error.message || 'Failed to fetch customer inventory');
  }
};

/**
 * Add items to customer inventory
 * @param {number} id - Customer ID
 * @param {Array<number>} itemIds - Array of item IDs to add
 * @returns {Promise<Object>} Result
 */
const addItemsToInventory = async (id, itemIds) => {
  try {
    logger.info('Adding items to customer inventory:', id);
    const response = await httpClient.post(`${BASE_PATH}/${id}/inventory/items`, { itemIds });
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to add items to inventory:', error);
    return Result.failure(error.message || 'Failed to add items');
  }
};

/**
 * Remove items from customer inventory
 * @param {number} id - Customer ID
 * @param {Array<number>} itemIds - Array of item IDs to remove
 * @returns {Promise<Object>} Result
 */
const removeItemsFromInventory = async (id, itemIds) => {
  try {
    logger.info('Removing items from customer inventory:', id);
    const response = await httpClient.delete(`${BASE_PATH}/${id}/inventory/items`, { data: { itemIds } });
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to remove items from inventory:', error);
    return Result.failure(error.message || 'Failed to remove items');
  }
};

const customerRepository = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerInventory,
  addItemsToInventory,
  removeItemsFromInventory
};

export default customerRepository;

