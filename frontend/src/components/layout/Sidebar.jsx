/**
 * Sidebar Component
 *
 * Reusable sidebar for all protected pages
 * Includes navigation menu and user actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../shared/constants/appConstants';

const Sidebar = ({ activeRoute = ROUTES.HOMEPAGE }) => {
  const navigate = useNavigate();


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
      route: ROUTES.CATEGORIES,
      label: 'Categories',
      icon: 'category'
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
    },
    {
      route: ROUTES.LOGS,
      label: 'Logs',
      icon: 'description'
    }
  ];

  return (
    <div className="w-64 bg-[#0d1117] border-r border-[#324d67] p-6 flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo Section - Top Center (Fixed) */}
      <div className="flex justify-center mb-8 border-b border-[#324d67] pb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TruckIcon />
          <h2 className="text-base font-bold text-[#ffffff] text-center">{APP_NAME}</h2>
        </div>
      </div>

      {/* Navigation Menu (Scrollable) */}
      <nav className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden pr-2">
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
    </div>
  );
};

export default Sidebar;
