/**
 * DashboardPage Component
 *
 * Main dashboard - placeholder for now
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import Button from '../../../components/forms/Button';
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {user?.name || user?.username}!
            </h1>
            <p className="text-[#92adc9]">
              Role: {user?.role}
            </p>
          </div>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards */}
          <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
            <h3 className="text-xl font-bold text-white mb-2">Orders</h3>
            <p className="text-[#92adc9]">Manage your orders</p>
          </div>

          <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
            <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
            <p className="text-[#92adc9]">Track your inventory</p>
          </div>

          <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
            <h3 className="text-xl font-bold text-white mb-2">Customers</h3>
            <p className="text-[#92adc9]">Manage customers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

