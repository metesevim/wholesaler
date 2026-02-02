/**
 * Sidebar Component
 *
 * Reusable sidebar for all protected pages
 * Includes navigation menu and user actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/hooks/useAuth';
import { ROUTES } from '../../shared/constants/appConstants';

const Sidebar = ({ activeRoute = ROUTES.HOMEPAGE }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

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
    }
  ];

  return (
    <div className="w-64 bg-[#0d1117] border-r border-[#324d67] p-6 flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#137fec] mb-2">Wholesaler</h2>
        <p className="text-sm text-[#92adc9]">Management System</p>
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

      {/* Divider */}
      <div className="border-t border-[#324d67] my-6"></div>

      {/* User Profile Section */}
      <div className="bg-[#192633] rounded-lg p-4 mb-6">
        <p className="text-xs text-[#92adc9] mb-1">Logged in as:</p>
        <p className="text-white font-medium text-sm">{user?.name || user?.username}</p>
        <p className="text-xs text-[#92adc9] mt-1">{user?.role}</p>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(user.iban);
            alert('IBAN copied to clipboard!');
          }}
          className="w-full text-left px-4 py-2 rounded-lg text-[#92adc9] hover:bg-[#192633] hover:text-white transition-all text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            content_copy
          </span>
          Copy IBAN
        </button>

        <button
          onClick={() => navigate(ROUTES.ADMIN_SETTINGS)}
          className="w-full text-left px-4 py-2 rounded-lg text-[#92adc9] hover:bg-[#192633] hover:text-white transition-all text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            settings
          </span>
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            logout
          </span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
