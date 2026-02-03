/**
 * Sidebar Component
 *
 * Reusable sidebar for all protected pages
 * Includes navigation menu and user actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/hooks/useAuth';
import Button from '../forms/Button';
import { ROUTES, APP_NAME } from '../../shared/constants/appConstants';

const Sidebar = ({ activeRoute = ROUTES.HOMEPAGE }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const TruckIcon = () => (
    <span className="material-symbols-outlined text-3xl" style={{ color: '#137fec', fontVariationSettings: '"FILL" 1' }}>
      local_shipping
    </span>
  );

  const navItems = [
    {
      route: ROUTES.HOMEPAGE,
      label: 'Homepage',
      icon: 'home'
    },
    {
      route: ROUTES.ORDERS,
      label: 'Orders',
      icon: 'assignment'
    },
    {
      route: ROUTES.INVENTORY,
      label: 'Inventory',
      icon: 'warehouse'
    },
    {
      route: ROUTES.CUSTOMERS,
      label: 'Customers',
      icon: 'people'
    },
    {
      route: ROUTES.PROVIDERS,
      label: 'Providers',
      icon: 'domain'
    },
    {
      route: ROUTES.EMPLOYEES,
      label: 'Employees',
      icon: 'group'
    }
  ];

  return (
    <div className="w-64 bg-[#0d1117] border-r border-[#324d67] p-6 flex flex-col h-screen sticky top-0">
      {/* Logo Section - Top Center */}
      <div className="flex justify-center mb-8 border-b border-[#324d67] pb-6">
        <div className="flex items-center gap-2">
          <TruckIcon />
          <h2 className="text-base font-bold text-[#ffffff] text-center">{APP_NAME}</h2>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-3 flex-1">
        {navItems.map((item) => (
          <button
            key={item.route}
            onClick={() => navigate(item.route)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
              activeRoute === item.route
                ? 'bg-[#137fec] text-white font-medium hover:bg-[#1a8fff]'
                : 'text-[#92adc9] hover:bg-[#192633] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="space-y-3">
        {user && (
          <div className="bg-[#192633] rounded-lg p-4 border border-[#324d67]">
            <p className="text-xs text-[#92adc9] mb-1">Logged in as:</p>
            <p className="text-sm font-semibold text-white">
              {user.name || user.fullName || user.username}
            </p>
            <p className="text-xs text-[#137fec]">{user.role}</p>
          </div>
        )}

        <div className="border-t border-[#324d67]"></div>

        {/* Copy IBAN Button */}
        {user?.iban && (
          <Button
            onClick={() => {
              navigator.clipboard.writeText(user.iban);
              alert('IBAN copied to clipboard!');
            }}
            variant="primary"
            fullWidth
            size="md"
          >
            Copy IBAN
          </Button>
        )}

        {/* Settings Button */}
        <Button
          onClick={() => navigate(ROUTES.ADMIN_SETTINGS)}
          variant="secondary"
          fullWidth
          size="md"
        >
          Settings
        </Button>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="danger"
          fullWidth
          size="md"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
