/**
 * Audit Log Repository
 *
 * Handles all audit log related API calls.
 */

import httpClient from '../client/httpClient';
import Result from '../../domain/models/Result';
import logger from '../../shared/utils/logger';

const BASE_PATH = '/audit-logs';

/**
 * Get audit logs with pagination and filters
 * @param {Object} filters - { page, limit, action, entityType, userId, search, startDate, endDate }
 * @returns {Promise<Object>} Result with logs array and pagination info
 */
const getAuditLogs = async (filters = {}) => {
  try {
    logger.info('Fetching audit logs', filters);
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.action) params.append('action', filters.action);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const url = params.toString() ? `${BASE_PATH}?${params.toString()}` : BASE_PATH;
    const response = await httpClient.get(url);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to fetch audit logs:', error);
    return Result.failure(error.message || 'Failed to fetch audit logs');
  }
};

/**
 * Get audit log statistics
 * @returns {Promise<Object>} Result with stats data
 */
const getAuditStats = async () => {
  try {
    logger.info('Fetching audit stats');
    const response = await httpClient.get(`${BASE_PATH}/stats`);
    return Result.success(response.data);
  } catch (error) {
    logger.error('Failed to fetch audit stats:', error);
    return Result.failure(error.message || 'Failed to fetch audit stats');
  }
};

const auditLogRepository = {
  getAuditLogs,
  getAuditStats,
};

export default auditLogRepository;

