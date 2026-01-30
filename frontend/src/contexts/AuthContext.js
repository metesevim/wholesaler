/**
 * Authentication Context
 *
 * Manages global authentication state.
 * Provides auth methods to the entire application.
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import authRepository from '../data/repositories/authRepository';
import storage from '../shared/utils/storage';
import logger from '../shared/utils/logger';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Initialize auth state on mount
   * Check if user has valid token
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken();

      if (token) {
        logger.info('Token found, user is authenticated');
        // Since we don't have a /me endpoint, just set authenticated state
        // User data will be set on login
        setIsAuthenticated(true);
        // Set a placeholder user object
        setUser({ authenticated: true });
      } else {
        logger.info('No token found');
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   * @param {Object} credentials - { username, password }
   * @returns {Promise<Object>} Result object
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      logger.info('Logging in user:', credentials.username);

      const result = await authRepository.login(credentials);

      if (result.success) {
        const { token, user } = result.data;

        // Store token
        storage.setToken(token);

        // Set authenticated state
        setIsAuthenticated(true);

        // Set user data from API response
        setUser(user);

        logger.info('Login successful');

        return { success: true, user };
      } else {
        setError(result.error);
        logger.error('Login failed:', result.error);

        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      logger.error('Login error:', err);

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    logger.info('Logging out user');

    // Call API (but don't wait for response)
    authRepository.logout().catch(err => {
      logger.warn('Logout API call failed:', err);
    });

    // Clear local state immediately
    storage.removeToken();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);

    logger.info('User logged out');
  }, []);

  /**
   * Update user data
   * @param {Object} userData - Updated user data
   */
  const updateUser = useCallback((userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  }, []);

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Result object
   */
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      logger.info('Updating user profile');

      const result = await authRepository.updateProfile(profileData);

      if (result.success) {
        // Update user data in context
        setUser(prevUser => ({
          ...prevUser,
          ...result.data
        }));

        logger.info('Profile updated successfully');
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        logger.error('Profile update failed:', result.error);
        return { success: false, message: result.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating profile';
      setError(errorMessage);
      logger.error('Profile update error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateUser,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;

