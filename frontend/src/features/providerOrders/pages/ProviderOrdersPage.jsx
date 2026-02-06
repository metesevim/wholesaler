/**
 * ProviderOrdersPage Component
 *
 * Manages provider orders (restock orders) with automatic low stock detection
 */

import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';
import Button from '../../../components/forms/Button';
import { providerOrderRepository } from '../../../data';
import { printProviderOrder } from '../../../shared/services/providerOrderService';
import { ROUTES } from '../../../shared/constants/appConstants';
import { formatDateToEuropean } from '../../../shared/utils/dateFormatter';
import logger from '../../../shared/utils/logger';

const ProviderOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingStock, setCheckingStock] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [sendingEmail, setSendingEmail] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;

      const result = await providerOrderRepository.getAllProviderOrders(filters);
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.error || 'Failed to load provider orders');
      }
    } catch (err) {
      logger.error('Failed to load provider orders:', err);
      setError('Failed to load provider orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStock = async () => {
    setCheckingStock(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await providerOrderRepository.checkAndCreateOrders();
      if (result.success) {
        const data = result.data;
        let message = `Stock check complete. Found ${data.lowStockItemsCount} low stock items.`;
        if (data.ordersCreated?.length > 0) {
          message += ` Created ${data.ordersCreated.length} new order(s).`;
        }
        if (data.itemsAddedToExisting?.length > 0) {
          message += ` Added ${data.itemsAddedToExisting.length} item(s) to existing orders.`;
        }
        setSuccess(message);
        loadOrders();
      } else {
        setError(result.error || 'Failed to check stock');
      }
    } catch (err) {
      logger.error('Failed to check stock:', err);
      setError('Failed to check stock');
    } finally {
      setCheckingStock(false);
    }
  };

  const handleSendEmail = async (orderId) => {
    setSendingEmail(orderId);
    setError(null);
    try {
      const result = await providerOrderRepository.sendOrderEmail(orderId);
      if (result.success) {
        setSuccess('Email sent successfully to provider');
        loadOrders();
      } else {
        setError(result.error || 'Failed to send email');
      }
    } catch (err) {
      logger.error('Failed to send email:', err);
      setError('Failed to send email. Make sure SMTP is configured.');
    } finally {
      setSendingEmail(null);
    }
  };

  const handlePrint = (order) => {
    try {
      printProviderOrder(order);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const result = await providerOrderRepository.updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setSuccess(`Order status updated to ${newStatus}`);
        loadOrders();
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err) {
      logger.error('Failed to update status:', err);
      setError('Failed to update status');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const result = await providerOrderRepository.deleteProviderOrder(orderId);
      if (result.success) {
        setSuccess('Order deleted successfully');
        loadOrders();
      } else {
        setError(result.error || 'Failed to delete order');
      }
    } catch (err) {
      logger.error('Failed to delete order:', err);
      setError('Failed to delete order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      CONFIRMED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      SHIPPED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      RECEIVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: 'schedule',
      SENT: 'send',
      CONFIRMED: 'check_circle',
      SHIPPED: 'local_shipping',
      RECEIVED: 'inventory',
      CANCELLED: 'cancel',
    };
    return icons[status] || 'help';
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.PROVIDER_ORDERS} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Provider Orders</h1>
              <p className="text-[#92adc9] mt-1">Manage restock orders to providers</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCheckStock}
                disabled={checkingStock}
                variant="secondary"
              >
                <span className="material-symbols-outlined mr-2" style={{ fontSize: '18px' }}>
                  {checkingStock ? 'sync' : 'inventory_2'}
                </span>
                {checkingStock ? 'Checking...' : 'Check Low Stock'}
              </Button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
              {success}
            </div>
          )}

          {/* Filter */}
          <div className="mb-6 flex gap-4 items-center">
            <label className="text-[#92adc9] text-sm">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[#324d67] bg-[#192633] text-white focus:outline-none focus:border-[#137fec]"
            >
              <option value="">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="SENT">Sent</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
              <span className="ml-3 text-white">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-[#192633] rounded-lg border border-[#324d67]">
              <span className="material-symbols-outlined text-[#92adc9] mb-3" style={{ fontSize: '48px' }}>
                shopping_cart
              </span>
              <p className="text-[#92adc9]">No provider orders found</p>
              <p className="text-[#92adc9] text-sm mt-1">
                Click "Check Low Stock" to automatically create orders for items below 50% capacity
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#192633] rounded-lg border border-[#324d67] p-6 hover:border-[#137fec]/50 transition-all"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#137fec]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#137fec]" style={{ fontSize: '24px' }}>
                          local_shipping
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          Order #{order.id} - {order.provider?.name}
                        </h3>
                        <p className="text-[#92adc9] text-sm">
                          Created: {formatDateToEuropean(order.createdAt)} • {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {getStatusIcon(order.status)}
                      </span>
                      {order.status}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4 bg-[#101922] rounded-lg p-4">
                    <div className="text-xs text-[#92adc9] uppercase tracking-wider mb-2">Items</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {order.items?.slice(0, 4).map((item) => (
                        <div key={item.id} className="text-sm text-white">
                          • {item.itemName} <span className="text-[#92adc9]">({item.quantity} {item.unit})</span>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="text-sm text-[#137fec]">
                          +{order.items.length - 4} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#324d67]">
                    <div className="text-white font-bold text-lg">
                      Total: ₺{(order.totalAmount || 0).toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      {/* Print Button */}
                      <button
                        onClick={() => handlePrint(order)}
                        className="px-3 py-2 rounded-lg border border-[#324d67] text-[#92adc9] hover:bg-[#324d67]/30 hover:text-white transition-all flex items-center gap-2"
                        title="Print Order"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                        Print
                      </button>

                      {/* Send Email Button (only for PENDING) */}
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleSendEmail(order.id)}
                          disabled={sendingEmail === order.id}
                          className="px-3 py-2 rounded-lg bg-[#137fec] text-white hover:bg-[#1a8fff] transition-all flex items-center gap-2 disabled:opacity-50"
                          title="Send to Provider"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {sendingEmail === order.id ? 'sync' : 'send'}
                          </span>
                          {sendingEmail === order.id ? 'Sending...' : 'Send Order'}
                        </button>
                      )}

                      {/* Mark as Received (only for SHIPPED) */}
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'RECEIVED')}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2"
                          title="Mark as Received"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inventory</span>
                          Mark Received
                        </button>
                      )}

                      {/* Status Dropdown */}
                      {(order.status !== 'RECEIVED' && order.status !== 'CANCELLED') && (
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[#324d67] bg-[#192633] text-white focus:outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SENT">Sent</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="RECEIVED">Received</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      )}

                      {/* Delete Button (only for PENDING or CANCELLED) */}
                      {(order.status === 'PENDING' || order.status === 'CANCELLED') && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
                          title="Delete Order"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Sent Info */}
                  {order.emailSent && (
                    <div className="mt-3 text-xs text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                      Email sent on {formatDateToEuropean(order.emailSentAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderOrdersPage;

