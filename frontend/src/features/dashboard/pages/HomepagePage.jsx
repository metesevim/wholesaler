/**
 * HomepagePage Component
 *
 * Main homepage - management dashboard
 */

import React, { useState, useEffect } from 'react';
import useAuth from '../../auth/hooks/useAuth';
import Sidebar from '../../../components/layout/Sidebar';
import { ROUTES } from '../../../shared/constants/appConstants';
import { orderRepository } from '../../../data';

const HomepagePage = () => {
  const { user } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const result = await orderRepository.getAllOrders();
      if (result.success && result.data) {
        setTotalOrders(result.data.length);
        const total = result.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        setTotalSales(total);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.HOMEPAGE} />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name || user?.username}!</h1>
            <p className="text-[#92adc9]">Manage your wholesale business from here</p>
          </div>

          {/* Sales Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Sales Card */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#192633] rounded-lg p-6 border border-[#1e3a5f] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-2">Total Sales</p>
                  <h3 className="text-3xl font-bold text-white">
                    ${loading ? '-' : totalSales.toFixed(2)}
                  </h3>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#92adc9', fontVariationSettings: '"wght" 400' }}>
                  trending_up
                </span>
              </div>
              <div className="pt-4 border-t border-[#324d67]">
                <p className="text-xs text-[#92adc9]">All-time revenue</p>
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#192633] rounded-lg p-6 border border-[#1e3a5f] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-2">Total Orders</p>
                  <h3 className="text-3xl font-bold text-white">
                    {loading ? '-' : totalOrders}
                  </h3>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#92adc9', fontVariationSettings: '"wght" 400' }}>
                  shopping_cart
                </span>
              </div>
              <div className="pt-4 border-t border-[#324d67]">
                <p className="text-xs text-[#92adc9]">Completed orders</p>
              </div>
            </div>

            {/* Average Order Value Card */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#192633] rounded-lg p-6 border border-[#1e3a5f] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-2">Avg Order Value</p>
                  <h3 className="text-3xl font-bold text-white">
                    ${loading || totalOrders === 0 ? '-' : (totalSales / totalOrders).toFixed(2)}
                  </h3>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#92adc9', fontVariationSettings: '"wght" 400' }}>
                  assessment
                </span>
              </div>
              <div className="pt-4 border-t border-[#324d67]">
                <p className="text-xs text-[#92adc9]">Average per order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepagePage;



