/**
 * AppProviders Component
 *
 * Wraps all global providers (Auth, Theme, etc.)
 * Makes it easy to add new providers in one place
 */

import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from '../contexts/AuthContext';

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired
};

export default AppProviders;

