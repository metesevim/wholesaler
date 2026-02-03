/**
 * HomepagePage Component
 *
 * Main homepage - sales dashboard
 */

import React, { useState, useEffect } from 'react';
import useAuth from '../../auth/hooks/useAuth';
import Sidebar from '../../../components/layout/Sidebar';
import { ROUTES } from '../../../shared/constants/appConstants';
import { orderRepository } from '../../../data';
import formatCurrency from '../../../shared/utils/formatCurrency';

const HomepagePage = () => {
  const { user } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [bestCustomer, setBestCustomer] = useState(null);
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

        // Calculate best customer
        const customerStats = {};
        result.data.forEach(order => {
          const customerId = order.customerId;
          if (!customerStats[customerId]) {
            customerStats[customerId] = {
              customerId,
              customerName: order.customer?.name || 'Unknown',
              orderCount: 0,
              totalValue: 0
            };
          }
          customerStats[customerId].orderCount += 1;
          customerStats[customerId].totalValue += order.totalAmount || 0;
        });

        // Find best customer (most orders, then highest value)
        const best = Object.values(customerStats).reduce((prev, current) => {
          if (current.orderCount > prev.orderCount) return current;
          if (current.orderCount === prev.orderCount && current.totalValue > prev.totalValue) return current;
          return prev;
        });

        setBestCustomer(best);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, color = 'blue', subtext }) => (
    <div className={`relative overflow-hidden rounded-xl p-6 border backdrop-blur-sm ${
      color === 'blue' 
        ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30 hover:border-blue-500/60' 
        : 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/30 hover:border-cyan-500/60'
    } transition-all duration-300 hover:shadow-lg`}>
      {/* Background accent */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 ${
        color === 'blue' ? 'bg-blue-500/5' : 'bg-cyan-500/5'
      } rounded-full`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[#92adc9] text-sm font-medium mb-2 uppercase tracking-wider">{label}</p>
            <h3 className="text-4xl font-bold text-white">
              {loading ? '...' : value}
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${
            color === 'blue' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
        </div>

        {subtext && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-[#92adc9]">{subtext}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.HOMEPAGE} />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="flex items-baseline justify-between mb-2">
              <h1 className="text-4xl font-bold text-white">
                Welcome back, <span className="text-blue-400">{user?.name || user?.username}!</span>
              </h1>
            </div>
            <p className="text-[#92adc9] text-lg">Here's what's happening with your wholesale business</p>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-md bg-blue-500/20 text-blue-400 w-10 h-10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">info</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Manage Your Business</h3>
                <p className="text-[#92adc9] text-sm leading-relaxed">
                  Navigate to Orders, Inventory, Customers, or Providers using the sidebar menu. Create new records, edit existing ones, and track your wholesale operations all in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon="trending_up"
              label="Total Sales"
              value={loading ? '-' : formatCurrency(totalSales)}
              color="blue"
              subtext="All-time revenue"
            />

            <StatCard
              icon="shopping_cart"
              label="Total Orders"
              value={loading ? '-' : totalOrders}
              color="cyan"
              subtext="Completed transactions"
            />

            <StatCard
              icon="assessment"
              label="Average Order"
              value={loading || totalOrders === 0 ? '-' : formatCurrency(totalSales / totalOrders)}
              color="blue"
              subtext="Per order average"
            />
          </div>

          {/* Best Customer Card */}
          <div className="mt-8">
            {loading ? (
              <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
                <p className="text-[#92adc9]">Loading...</p>
              </div>
            ) : bestCustomer ? (
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#92adc9] text-sm font-medium mb-2 uppercase tracking-wider">Best Customer</p>
                    <h3 className="text-3xl font-bold text-white mb-4">{bestCustomer.customerName}</h3>
                    <div className="space-y-2">
                      <p className="text-[#92adc9]">
                        <span className="font-semibold">Total Orders:</span> {bestCustomer.orderCount}
                      </p>
                      <p className="text-[#92adc9]">
                        <span className="font-semibold">Total Value:</span> {formatCurrency(bestCustomer.totalValue)}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                    <span className="material-symbols-outlined text-4xl">star</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
                <p className="text-[#92adc9]">No customers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepagePage;
