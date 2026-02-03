/**
 * HomepagePage Component
 *
 * Main homepage - sales dashboard
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import Sidebar from '../../../components/layout/Sidebar';
import Button from '../../../components/forms/Button';
import { ROUTES } from '../../../shared/constants/appConstants';
import { orderRepository, inventoryRepository } from '../../../data';
import formatCurrency from '../../../shared/utils/formatCurrency';

const HomepagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({
    PENDING: 0,
    DELIVERED: 0,
    SHIPPED: 0,
    CANCELLED: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load orders data
      const result = await orderRepository.getAllOrders();
      if (result.success && result.data) {
        const allOrders = result.data;
        setTotalOrders(allOrders.length);
        const total = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        setTotalSales(total);

        // Count order statuses
        const statusCount = {
          PENDING: 0,
          DELIVERED: 0,
          SHIPPED: 0,
          CANCELLED: 0
        };
        allOrders.forEach(order => {
          if (statusCount.hasOwnProperty(order.status)) {
            statusCount[order.status]++;
          }
        });
        setOrderStatuses(statusCount);
      }

      // Load inventory data for low stock alerts
      const inventoryResult = await inventoryRepository.getAllItems();
      if (inventoryResult.success && inventoryResult.data) {
        console.log('📦 All inventory items loaded:', inventoryResult.data);
        const lowStock = inventoryResult.data
          .filter(item => {
            const threshold = item.lowStockAlert !== undefined && item.lowStockAlert !== null ? item.lowStockAlert : 20;
            const quantity = item.quantity || 0;
            const isLow = quantity < threshold;
            console.log(`  - ${item.name}: qty=${quantity}, threshold=${threshold}, lowStockAlert=${item.lowStockAlert}, isLow=${isLow}`);
            return isLow;
          })
          .sort((a, b) => a.quantity - b.quantity); // Sort by quantity ascending
        console.log('🚨 Low stock items found:', lowStock);
        setLowStockItems(lowStock);
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

          {/* Sales Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Sales Overview</h2>
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

          {/* Order Status Summary */}
          <div className="mt-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Order Status Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4  gap-4">
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#92adc9] text-sm mb-1">Pending</p>
                    <p className="text-2xl font-bold text-white">{orderStatuses.PENDING}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                    <span className="material-symbols-outlined text-2xl">schedule</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#92adc9] text-sm mb-1">Delivered</p>
                    <p className="text-2xl font-bold text-white">{orderStatuses.DELIVERED}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                    <span className="material-symbols-outlined text-2xl">task_alt</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#92adc9] text-sm mb-1">Shipped</p>
                    <p className="text-2xl font-bold text-white">{orderStatuses.SHIPPED}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <span className="material-symbols-outlined text-2xl">local_shipping</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#92adc9] text-sm mb-1">Cancelled</p>
                    <p className="text-2xl font-bold text-white">{orderStatuses.CANCELLED}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <span className="material-symbols-outlined text-2xl">cancel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="mt-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Low Stock Alert</h2>
            {lowStockItems.length === 0 ? (
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">All Stock Levels Healthy</p>
                    <p className="text-[#92adc9] text-sm mt-1">All items are well-stocked</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-lg p-4 hover:border-red-500/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{item.name}</p>
                            <p className="text-xs text-[#92adc9] mt-1">
                              {item.description && `${item.description}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold text-lg">
                          {item.quantity} {item.unit}
                        </p>
                        <Button
                          onClick={() => navigate(ROUTES.INVENTORY)}
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                        >
                          Restock
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepagePage;
