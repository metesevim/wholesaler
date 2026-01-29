/**
 * useAuth Hook
 *
 * Custom hook to access authentication context.
 * Must be used within AuthProvider.
 */

import { useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';

/**
 * Hook to access auth state and methods
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;

