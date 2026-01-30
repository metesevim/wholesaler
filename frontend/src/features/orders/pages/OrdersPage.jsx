/**
 * OrdersPage Component
 *
 * Page for viewing and managing orders
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
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

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Orders"
          subtitle="  Manage your orders"
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
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        Order #{order.id}
                      </h3>
                    </div>

                    <p className="text-sm text-[#92adc9] mb-2">
                      Customer ID: {order.customerId}
                    </p>

                    {order.createdAt && (
                        <p className="text-[#92adc9] text-sm mb-2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    )}

                  </div>
                  <div className="text-right" className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' :
                              order.status === 'CONFIRMED' ? 'bg-blue-900 text-blue-200' :
                                  order.status === 'PROCESSING' ? 'bg-blue-800 text-blue-100' :
                                      order.status === 'SHIPPED' ? 'bg-purple-900 text-purple-200' :
                                          order.status === 'DELIVERED' ? 'bg-green-900 text-green-200' :
                                              'bg-red-900 text-red-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <Button
                        onClick={() => navigate(`${ROUTES.ORDERS}/${order.id}/edit`)}
                        variant="secondary"
                        size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#324d67]">
                    <p className="text-sm text-[#92adc9] mb-2">Items:</p>
                    <ul className="text-sm text-[#92adc9] space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          • Item {item.adminItemId || item.id}: {item.quantity} {item.unit || 'unit'}
                        </li>
                      ))}
                    </ul>
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
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
