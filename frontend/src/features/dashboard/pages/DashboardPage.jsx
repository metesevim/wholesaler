/**
 * DashboardPage Component
 *
 * Main dashboard - placeholder for now
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import { ROUTES } from '../../../shared/constants/appConstants';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={`Welcome, ${user?.name || user?.username}!`}
          showDashboardButton={false}
          rightContent={
            <Button onClick={handleLogout} variant="secondary">
              Logout
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Card */}
          <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors cursor-pointer group"
               onClick={() => navigate(ROUTES.ORDERS)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Orders</h3>
                <p className="text-[#92adc9]">Manage your orders</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ROUTES.ADD_ORDER);
                }}
                className="w-10 h-10 rounded-full bg-[#137fec] hover:bg-[#1a8fff] text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                title="Create New Order"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-[#324d67]">
              <p className="text-sm text-[#92adc9] group-hover:text-[#137fec] transition-colors">
                Click to view all orders →
              </p>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors cursor-pointer group"
               onClick={() => navigate(ROUTES.INVENTORY)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
                <p className="text-[#92adc9]">Track your inventory</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ROUTES.INVENTORY);
                }}
                className="w-10 h-10 rounded-full bg-[#137fec] hover:bg-[#1a8fff] text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                title="Add New Inventory Item"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-[#324d67]">
              <p className="text-sm text-[#92adc9] group-hover:text-[#137fec] transition-colors">
                Click to view all inventory →
              </p>
            </div>
          </div>

          {/* Customers Card */}
          <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors cursor-pointer group"
               onClick={() => navigate(ROUTES.CUSTOMERS)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Customers</h3>
                <p className="text-[#92adc9]">Manage customers</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ROUTES.ADD_CUSTOMER);
                }}
                className="w-10 h-10 rounded-full bg-[#137fec] hover:bg-[#1a8fff] text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                title="Add New Customer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-[#324d67]">
              <p className="text-sm text-[#92adc9] group-hover:text-[#137fec] transition-colors">
                Click to view all customers →
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

