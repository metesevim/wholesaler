/**
 * Order Repository
 *
 * Handles all order-related API calls.
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const BASE_PATH = '/orders';

/**
 * Get all orders
 * @param {Object} filters - Optional filters (status, customerId)
 * @returns {Promise<Object>} Result with orders array
 */
const getAllOrders = async (filters = {}) => {
  try {
    logger.info('Fetching all orders', filters);
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customerId', filters.customerId);

    const url = params.toString() ? `${BASE_PATH}?${params.toString()}` : BASE_PATH;
    const response = await httpClient.get(url);
    return Result.success(response.data.orders || []);
  } catch (error) {
    logger.error('Failed to fetch orders:', error);
    return Result.failure(error.message || 'Failed to fetch orders');
  }
};

/**
 * Get order by ID
 * @param {number} id - Order ID
 * @returns {Promise<Object>} Result with order data
 */
const getOrderById = async (id) => {
  try {
    logger.info('Fetching order:', id);
    const response = await httpClient.get(`${BASE_PATH}/${id}`);
    return Result.success(response.data.order);
  } catch (error) {
    logger.error('Failed to fetch order:', error);
    return Result.failure(error.message || 'Failed to fetch order');
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data with customerId, items, and notes
 * @returns {Promise<Object>} Result with created order
 */
const createOrder = async (orderData) => {
  try {
    logger.info('Creating order for customer:', orderData.customerId);
    const response = await httpClient.post(BASE_PATH, orderData);
    return Result.success(response.data.order);
  } catch (error) {
    logger.error('Failed to create order:', error);
    return Result.failure(error.message || 'Failed to create order');
  }
};

/**
 * Update order status
 * @param {number} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Result with updated order
 */
const updateOrderStatus = async (id, status) => {
  try {
    logger.info('Updating order status:', id, status);
    const response = await httpClient.put(`${BASE_PATH}/${id}/status`, { status });
    return Result.success(response.data.order);
  } catch (error) {
    logger.error('Failed to update order status:', error);
    return Result.failure(error.message || 'Failed to update order status');
  }
};

/**
 * Cancel an order
 * @param {number} id - Order ID
 * @returns {Promise<Object>} Result
 */
const cancelOrder = async (id) => {
  try {
    logger.info('Cancelling order:', id);
    const response = await httpClient.post(`${BASE_PATH}/${id}/cancel`);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to cancel order:', error);
    return Result.failure(error.message || 'Failed to cancel order');
  }
};

/**
 * Add item to pending order
 * @param {number} id - Order ID
 * @param {Object} itemData - Item data (adminItemId, quantity, unit)
 * @returns {Promise<Object>} Result with updated order
 */
const addItemToOrder = async (id, itemData) => {
  try {
    logger.info('Adding item to order:', id);
    const response = await httpClient.post(`${BASE_PATH}/${id}/items`, itemData);
    return Result.success(response.data.order);
  } catch (error) {
    logger.error('Failed to add item to order:', error);
    return Result.failure(error.message || 'Failed to add item to order');
  }
};

/**
 * Get customer orders
 * @param {number} customerId - Customer ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} Result with orders array
 */
const getCustomerOrders = async (customerId, status = null) => {
  try {
    logger.info('Fetching customer orders:', customerId);
    const url = status
      ? `${BASE_PATH}/customer/${customerId}?status=${status}`
      : `${BASE_PATH}/customer/${customerId}`;
    const response = await httpClient.get(url);
    return Result.success(response.data.orders || []);
  } catch (error) {
    logger.error('Failed to fetch customer orders:', error);
    return Result.failure(error.message || 'Failed to fetch customer orders');
  }
};

/**
 * Get available items for customer order
 * @param {number} customerId - Customer ID
 * @returns {Promise<Object>} Result with available items
 */
const getAvailableItemsForCustomer = async (customerId) => {
  try {
    logger.info('Fetching available items for customer:', customerId);
    const response = await httpClient.get(`${BASE_PATH}/customer/${customerId}/available-items`);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to fetch available items:', error);
    return Result.failure(error.message || 'Failed to fetch available items');
  }
};

/**
 * Get order summary statistics
 * @returns {Promise<Object>} Result with summary data
 */
const getOrderSummary = async () => {
  try {
    logger.info('Fetching order summary');
    const response = await httpClient.get(`${BASE_PATH}/summary`);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to fetch order summary:', error);
    return Result.failure(error.message || 'Failed to fetch order summary');
  }
};

const orderRepository = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  addItemToOrder,
  getCustomerOrders,
  getAvailableItemsForCustomer,
  getOrderSummary
};

export default orderRepository;

