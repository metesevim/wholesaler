/**
 * HTTP Client
 *
 * Centralized HTTP client using axios.
 * Handles authentication, error handling, and request/response interceptors.
 */

import axios from 'axios';
import { API_CONFIG } from './apiConfig';
import storage from '../../shared/utils/storage';
import logger from '../../shared/utils/logger';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug('HTTP Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });

    return config;
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    logger.debug('HTTP Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    logger.error('HTTP Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        storage.removeToken();
        window.location.href = '/login';
      }

      // Return structured error
      return Promise.reject({
        status,
        message: data.message || data.error || 'An error occurred',
        data: data
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        data: null
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        data: null
      });
    }
  }
);

/**
 * HTTP Client API
 */
const httpClient = {
  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} config - Axios config
   * @returns {Promise} Axios response
   */
  get: (url, config = {}) => {
    return axiosInstance.get(url, config);
  },

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {*} data - Request body
   * @param {Object} config - Axios config
   * @returns {Promise} Axios response
   */
  post: (url, data, config = {}) => {
    return axiosInstance.post(url, data, config);
  },

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {*} data - Request body
   * @param {Object} config - Axios config
   * @returns {Promise} Axios response
   */
  put: (url, data, config = {}) => {
    return axiosInstance.put(url, data, config);
  },

  /**
   * PATCH request
   * @param {string} url - Request URL
   * @param {*} data - Request body
   * @param {Object} config - Axios config
   * @returns {Promise} Axios response
   */
  patch: (url, data, config = {}) => {
    return axiosInstance.patch(url, data, config);
  },

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {Object} config - Axios config
   * @returns {Promise} Axios response
   */
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  }
};

export default httpClient;

