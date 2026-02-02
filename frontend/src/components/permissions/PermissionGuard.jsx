/**
 * PermissionGuard Component
 *
 * Component to conditionally render content based on user permissions
 */

import React from 'react';
import PropTypes from 'prop-types';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissionUtils';

const PermissionGuard = ({
  children,
  requiredPermission = null,
  requiredPermissions = null,
  requireAll = false,
  userPermissions = [],
  fallback = null
}) => {
  let hasAccess = false;

  if (requiredPermission) {
    // Single permission check
    hasAccess = hasPermission(userPermissions, requiredPermission);
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    // Multiple permissions check
    if (requireAll) {
      hasAccess = hasAllPermissions(userPermissions, requiredPermissions);
    } else {
      hasAccess = hasAnyPermission(userPermissions, requiredPermissions);
    }
  } else {
    // No permission required
    hasAccess = true;
  }

  return hasAccess ? children : fallback;
};

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requiredPermission: PropTypes.string,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool,
  userPermissions: PropTypes.arrayOf(PropTypes.string),
  fallback: PropTypes.node
};

export default PermissionGuard;
