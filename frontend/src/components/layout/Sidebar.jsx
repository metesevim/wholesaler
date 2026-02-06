/**
 * Sidebar Component
 *
 * Reusable sidebar for all protected pages
 * Includes navigation menu with collapsible sections
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../shared/constants/appConstants';

const Sidebar = ({ activeRoute = ROUTES.HOMEPAGE }) => {
  const navigate = useNavigate();

  // Initialize from localStorage or default to expanded
  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('sidebarExpandedSections');
    return saved ? JSON.parse(saved) : { operations: true, admin: true };
  });

  // Save to localStorage whenever expandedSections changes
  useEffect(() => {
    localStorage.setItem('sidebarExpandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const TruckIcon = () => (
    <span className="material-symbols-outlined text-3xl" style={{ color: '#137fec', fontVariationSettings: '"FILL" 1' }}>
      local_shipping
    </span>
  );

  const sections = [
    {
      id: 'operations',
      label: 'OPERATIONS',
      items: [
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
          icon: 'restaurant'
        },
        {
          route: ROUTES.PROVIDERS,
          label: 'Providers',
          icon: 'domain'
        }
      ]
    },
    {
      id: 'admin',
      label: 'ADMINISTRATIVE',
      items: [
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
      ]
    }
  ];

  return (
    <div className="w-64 bg-[#0d1117] border-r border-[#324d67] p-6 flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo Section - Top Center (Fixed) */}
      <div className="flex justify-center mb-8 pb-5 flex-shrink-0 border-b border-[#324d67]">
        <div className="flex items-center gap-2">
          <TruckIcon />
          <h2 className="text-base font-bold text-[#ffffff] text-center">{APP_NAME}</h2>
        </div>
      </div>

      {/* Navigation Menu (Scrollable) */}
      <nav className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden pr-2 pb-4">
        {/* Homepage - Standalone Item */}
        <button
          onClick={() => navigate(ROUTES.HOMEPAGE)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
            activeRoute === ROUTES.HOMEPAGE
              ? 'bg-[#137fec] text-white font-medium hover:bg-[#1a8fff]'
              : 'text-[#92adc9] hover:bg-[#192633] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            home
          </span>
          Homepage
        </button>


        {/* Collapsible Sections */}
        {sections.map((section) => (
          <div key={section.id} className="mt-4 first:mt-0">
            {/* Section Header */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSection(section.id);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#137fec]/15 border border-[#137fec]/30 rounded-lg hover:bg-[#137fec]/25 hover:border-[#137fec]/50 transition-all"
            >
              <span>{section.label}</span>
              <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{
                transform: expandedSections[section.id] ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                expand_more
              </span>
            </button>

            {/* Section Items */}
            {expandedSections[section.id] && (
              <div className="space-y-2 mt-3 pl-2">
                {section.items.map((item) => (
                  <button
                    key={item.route}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(item.route);
                    }}
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
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Settings and Logout Buttons - Bottom */}
      <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-[#324d67] flex-shrink-0">
        <button
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 text-[#92adc9] hover:bg-[#192633] hover:text-white border border-[#324d67] hover:border-[#137fec]"
          title="Settings"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            settings
          </span>
          Settings
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate(ROUTES.LOGIN);
          }}
          className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
          title="Logout"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            logout
          </span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
