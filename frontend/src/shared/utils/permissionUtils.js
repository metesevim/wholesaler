/**
 * Permission Utilities
 *
 * Helper functions for permission checking and management
 */

/**
 * Check if user has a specific permission
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return requiredPermissions.some(perm => userPermissions.includes(perm));
};

/**
 * Check if user has all of the required permissions
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return requiredPermissions.every(perm => userPermissions.includes(perm));
};

/**
 * Get all navigation items user can access
 */
export const getAccessibleNav = (userRole, userPermissions) => {
  const navItems = [
    {
      route: '/homepage',
      label: 'Homepage',
      icon: 'home',
      requiredPermission: null // Always accessible
    },
    {
      route: '/orders',
      label: 'Orders',
      icon: 'assignment',
      requiredPermission: 'VIEW_ORDERS'
    },
    {
      route: '/inventory',
      label: 'Inventory',
      icon: 'warehouse',
      requiredPermission: 'VIEW_INVENTORY'
    },
    {
      route: '/customers',
      label: 'Customers',
      icon: 'people',
      requiredPermission: 'VIEW_CUSTOMERS'
    },
    {
      route: '/providers',
      label: 'Providers',
      icon: 'domain',
      requiredPermission: 'VIEW_PROVIDERS'
    },
    {
      route: '/employees',
      label: 'Employees',
      icon: 'group',
      requiredPermission: 'ADMIN' // Only for admins
    }
  ];

  // Filter based on role and permissions
  return navItems.filter(item => {
    // Admins can access everything
    if (userRole === 'Admin') {
      return true;
    }

    // No permission required - accessible to all
    if (item.requiredPermission === null) {
      return true;
    }

    // Admin-only routes
    if (item.requiredPermission === 'ADMIN') {
      return false;
    }

    // Check if user has the required permission
    return hasPermission(userPermissions, item.requiredPermission);
  });
};

/**
 * Check if user can perform an action based on their role and permissions
 */
export const canPerformAction = (userRole, userPermissions, action) => {
  // Admins can do everything
  if (userRole === 'Admin') {
    return true;
  }

  // Check if user has the required permission for this action
  return hasPermission(userPermissions, action);
};
