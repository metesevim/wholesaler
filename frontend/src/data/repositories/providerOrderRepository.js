/**
 * Provider Order Repository
 * Handles API calls for provider orders (restock orders)
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const providerOrderRepository = {
  /**
   * Get all provider orders
   */
  getAllProviderOrders: async (filters = {}) => {
    try {
      logger.info('Fetching all provider orders', filters);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.providerId) params.append('providerId', filters.providerId);

      const queryString = params.toString();
      const url = queryString ? `/provider-orders?${queryString}` : '/provider-orders';

      const response = await httpClient.get(url);
      return Result.success(response.data.orders);
    } catch (error) {
      logger.error('Failed to fetch provider orders:', error);
      return Result.failure(error.response?.data?.error || 'Failed to fetch provider orders');
    }
  },

  /**
   * Get provider order by ID
   */
  getProviderOrderById: async (id) => {
    try {
      logger.info('Fetching provider order:', id);
      const response = await httpClient.get(`/provider-orders/${id}`);
      return Result.success(response.data.order);
    } catch (error) {
      logger.error('Failed to fetch provider order:', error);
      return Result.failure(error.response?.data?.error || 'Failed to fetch provider order');
    }
  },

  /**
   * Check stock and create provider orders for low stock items
   */
  checkAndCreateOrders: async () => {
    try {
      logger.info('Checking stock and creating provider orders');
      const response = await httpClient.post('/provider-orders/check-stock');
      return Result.success(response.data);
    } catch (error) {
      logger.error('Failed to check stock:', error);
      return Result.failure(error.response?.data?.error || 'Failed to check stock');
    }
  },

  /**
   * Add item to provider order
   */
  addItemToOrder: async (orderId, itemData) => {
    try {
      logger.info('Adding item to provider order:', { orderId, itemData });
      const response = await httpClient.post(`/provider-orders/${orderId}/items`, itemData);
      return Result.success(response.data.order);
    } catch (error) {
      logger.error('Failed to add item to order:', error);
      return Result.failure(error.response?.data?.error || 'Failed to add item to order');
    }
  },

  /**
   * Remove item from provider order
   */
  removeItemFromOrder: async (orderId, itemId) => {
    try {
      logger.info('Removing item from provider order:', { orderId, itemId });
      const response = await httpClient.delete(`/provider-orders/${orderId}/items/${itemId}`);
      return Result.success(response.data.order);
    } catch (error) {
      logger.error('Failed to remove item from order:', error);
      return Result.failure(error.response?.data?.error || 'Failed to remove item from order');
    }
  },

  /**
   * Update provider order status
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      logger.info('Updating provider order status:', { orderId, status });
      const response = await httpClient.patch(`/provider-orders/${orderId}/status`, { status });
      return Result.success(response.data.order);
    } catch (error) {
      logger.error('Failed to update order status:', error);
      return Result.failure(error.response?.data?.error || 'Failed to update order status');
    }
  },

  /**
   * Send order email to provider
   */
  sendOrderEmail: async (orderId) => {
    try {
      logger.info('Sending order email:', orderId);
      const response = await httpClient.post(`/provider-orders/${orderId}/send-email`);
      return Result.success(response.data);
    } catch (error) {
      logger.error('Failed to send order email:', error);
      return Result.failure(error.response?.data?.error || 'Failed to send order email');
    }
  },

  /**
   * Delete provider order
   */
  deleteProviderOrder: async (orderId) => {
    try {
      logger.info('Deleting provider order:', orderId);
      const response = await httpClient.delete(`/provider-orders/${orderId}`);
      return Result.success(response.data);
    } catch (error) {
      logger.error('Failed to delete provider order:', error);
      return Result.failure(error.response?.data?.error || 'Failed to delete provider order');
    }
  },
};

export default providerOrderRepository;

