/**
 * OrdersPage Component
 *
 * Page for viewing and managing orders
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import { orderRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderRepository.getAllOrders();
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      logger.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group orders by status
  const getOrdersByStatus = () => {
    const grouped = {
      PENDING: [],
      SHIPPED: [],
      DELIVERED: [],
      CANCELLED: []
    };

    orders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  };

  const StatusSection = ({ status, statusOrders, statusConfig }) => {
    if (statusOrders.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className={`text-xl font-bold text-white`}>{status}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
            {statusOrders.length}
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {statusOrders.map(order => (
            <div
              key={order.id}
              onClick={() => navigate(`${ROUTES.ORDERS}/${order.id}/edit`)}
              className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {order.customer?.name}'s Order - {new Date(order.createdAt).toLocaleDateString()}
                    </h3>
                  </div>

                  <p className="text-sm text-[#92adc9] mb-2">
                    Total: <span className="font-bold text-white">₺{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</span>
                  </p>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#324d67]">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-[#92adc9] mb-2 font-semibold">Items:</p>
                      <ul className="text-sm text-[#92adc9] space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            • {item.adminItem?.name || `Item ${item.adminItemId || item.id}`}: {item.quantity} {item.unit || 'unit'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-end justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusConfig.color}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="mt-4 pt-4 border-t border-[#324d67]">
                  <p className="text-sm text-[#92adc9]">
                    <span className="font-semibold">Notes:</span> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.ORDERS} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Orders"
          subtitle="Manage your orders"
          rightContent={
            <Button
              onClick={() => navigate(ROUTES.ADD_ORDER)}
              variant="primary"
            >
              + Create Order
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
            <Button onClick={loadOrders} variant="secondary" className="mt-3">
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin">
              <svg className="w-12 h-12 text-[#137fec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="ml-4 text-white">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#92adc9] text-lg mb-4">No orders found</p>
            <Button
              onClick={() => navigate(ROUTES.ADD_ORDER)}
              variant="primary"
            >
              Create Your First Order
            </Button>
          </div>
        ) : (
          <div>
            <StatusSection
              status="Pending"
              statusOrders={getOrdersByStatus().PENDING}
              statusConfig={{ color: 'bg-yellow-500/20 text-yellow-400' }}
            />
            <StatusSection
              status="Shipped"
              statusOrders={getOrdersByStatus().SHIPPED}
              statusConfig={{ color: 'bg-blue-500/20 text-blue-400' }}
            />
            <StatusSection
              status="Delivered"
              statusOrders={getOrdersByStatus().DELIVERED}
              statusConfig={{ color: 'bg-green-500/20 text-green-400' }}
            />
            <StatusSection
              status="Cancelled"
              statusOrders={getOrdersByStatus().CANCELLED}
              statusConfig={{ color: 'bg-red-500/20 text-red-400' }}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
