/**
 * EditOrderPage Component
 *
 * Page for editing and managing an existing order
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import { orderRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import { formatDateToEuropean, formatDateTimeToEuropean } from '../../../shared/utils/dateFormatter';
import logger from '../../../shared/utils/logger';
import { printPickingList } from '../../../shared/services/pickingListService';

const ORDER_STATUSES = [
  'PENDING',
  'SHIPPED',
  'DELIVERED'
];

const STATUS_COLORS = {
  'PENDING': 'bg-yellow-500/20 text-yellow-400',
  'SHIPPED': 'bg-blue-500/20 text-blue-400',
  'DELIVERED': 'bg-green-500/20 text-green-400',
  'CANCELLED': 'bg-red-500/20 text-red-400'
};

const EditOrderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderRepository.getOrderById(parseInt(id));
      if (result.success) {
        setOrder(result.data);
      } else {
        setError('Failed to load order');
      }
    } catch (err) {
      logger.error('Failed to load order:', err);
      setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status) {
      setError('Please select a different status');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await orderRepository.updateOrderStatus(parseInt(id), newStatus);
      if (result.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
        setSuccess(`Order status updated to ${newStatus}`);
      } else {
        setError(result.error || 'Failed to update order status');
      }
    } catch (err) {
      logger.error('Failed to update order status:', err);
      setError('Failed to update order status. Please try again.');
    }
  };

  const handleCancelOrder = async () => {
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      setError(`Cannot cancel an order with status ${order.status}`);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${order.id}? Inventory will be restored.`
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      const result = await orderRepository.cancelOrder(parseInt(id));
      if (result.success) {
        setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
        setSuccess('Order cancelled successfully. Inventory has been restored.');
      } else {
        setError(result.error || 'Failed to cancel order');
      }
    } catch (err) {
      logger.error('Failed to cancel order:', err);
      setError('Failed to cancel order. Please try again.');
    }
  };

  const handleDeleteOrder = async () => {
    if (order.status === 'SHIPPED') {
      setError(`Cannot delete orders with status: ${order.status}`);
      return;
    }

    const confirmed = window.confirm(
      `Delete order #${id}? ${
        order.status === 'PENDING'
          ? 'Inventory will be restored.'
          : ''
      }`
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      const result = await orderRepository.deleteOrder(parseInt(id));
      if (result.success) {
        setSuccess('Order deleted successfully');
        setTimeout(() => {
          navigate(ROUTES.ORDERS);
        }, 1500);
      } else {
        setError(result.error || 'Failed to delete order');
      }
    } catch (err) {
      logger.error('Failed to delete order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleSetPaymentDate = async () => {
    setError(null);
    setSuccess(null);

    try {
      // Allow updating the payment deadline
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + 30); // Default to 30 days from now

      const result = await orderRepository.updateOrder(parseInt(id), {
        ...order,
        lastPaymentDate: newDeadline.toISOString()
      });
      if (result.success) {
        setOrder(prev => ({ ...prev, lastPaymentDate: newDeadline.toISOString() }));
        setSuccess('Payment deadline updated');
      } else {
        setError(result.error || 'Failed to update payment deadline');
      }
    } catch (err) {
      logger.error('Failed to update payment deadline:', err);
      setError('Failed to update payment deadline. Please try again.');
    }
  };

  // Sort items by category priority (lower priority number = higher in list)
  const getSortedItems = () => {
    if (!order?.items) return [];

    return [...order.items].sort((a, b) => {
      const categoryA = a.adminItem?.category;
      const categoryB = b.adminItem?.category;

      // If either has no category, sort to end
      if (!categoryA && !categoryB) return 0;
      if (!categoryA) return 1;
      if (!categoryB) return -1;

      // Sort by category priority (ascending)
      return (categoryA.priority || 0) - (categoryB.priority || 0);
    });
  };

  // Print warehouse picking list using service
  const handlePrintPickingList = () => {
    printPickingList(order);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101922] p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin">
            <svg className="w-12 h-12 text-[#137fec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="ml-4 text-white">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#101922] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">Order not found</p>
            <Button onClick={() => navigate(ROUTES.ORDERS)} variant="primary">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.ORDERS} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title={order && order.createdAt ? `${order.customer?.name || 'Order'}'s Order - ${formatDateToEuropean(order.createdAt)}` : 'Order Details'}
            subtitle="Manage order status and details"
            backButton
            onBack={() => navigate(ROUTES.ORDERS)}
          />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900 border border-green-500 rounded-lg">
            <p className="text-green-200">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
              <h2 className="text-xl font-bold text-white mb-6">Order Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-1">Customer Name</p>
                  <p className="text-white text-lg">{order.customer?.name || 'Unknown Customer'}</p>
                </div>

                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-1">Customer Email</p>
                  <p className="text-white text-lg">{order.customer?.email || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-1">Customer ID</p>
                  <p className="text-white text-lg">{order.customerId}</p>
                </div>

                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-1">Total Amount</p>
                  <p className="text-white text-lg font-bold">₺{order.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>

                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-1">Created</p>
                  <p className="text-white">
                    {order.createdAt ? formatDateTimeToEuropean(order.createdAt) : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[#92adc9] text-sm font-semibold mb-1">Payment Deadline</p>
                  <p className="text-white">
                    {order.lastPaymentDate ? formatDateToEuropean(order.lastPaymentDate) : 'Not set'}
                  </p>
                </div>

                {order.notes && (
                  <div>
                    <p className="text-[#92adc9] text-sm font-semibold mb-1">Notes</p>
                    <p className="text-white">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-white">Items ({order.items.length})</h2>
                  <button
                    onClick={() => handlePrintPickingList(order)}
                    className="h-10 px-6 rounded-lg bg-[#137fec] text-white hover:bg-[#0f5fb8]
                      hover:shadow-lg hover:shadow-blue-500/20 active:scale-98
                      transition-all duration-200 flex items-center justify-center font-medium text-sm"
                    title="Print Picking List"
                  >
                    Print
                  </button>
                </div>

                <div className="space-y-4">
                  {getSortedItems().map((item, idx) => (
                    <div key={idx} className="bg-[#101922] rounded p-4 border border-[#324d67]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-semibold">{item.itemName || `Item ${item.adminItemId}`}</p>
                            {item.adminItem?.category && (
                              <span className="text-xs px-2 py-1 rounded bg-[#137fec]/20 text-[#137fec]">
                                {item.adminItem.category.name}
                              </span>
                            )}
                          </div>
                          <p className="text-[#92adc9] text-sm">ID: {item.adminItemId}</p>
                        </div>
                        <p className="text-white font-bold">₺{item.totalPrice?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div className="flex justify-between text-sm text-[#92adc9]">
                        <span>Quantity: {item.quantity} {item.unit}</span>
                        <span>Price: ₺{item.pricePerUnit?.toFixed(2) || '0.00'} per unit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Management Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
              <h3 className="text-lg font-bold text-white mb-4">Current Status</h3>
              <div className={`px-4 py-3 rounded-lg text-center font-semibold ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </div>
            </div>

            {/* Status Change */}
            <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
              <h3 className="text-lg font-bold text-white mb-4">Change Status</h3>
              <div className="space-y-2">
                {ORDER_STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={status === order.status}
                    className={`w-full px-4 py-2 rounded text-sm font-semibold transition-colors ${
                      status === order.status
                        ? 'bg-[#324d67] text-[#92adc9] cursor-not-allowed'
                        : 'bg-[#324d67] text-white hover:bg-[#137fec] hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">

              <Button
                onClick={handleSetPaymentDate}
                variant="primary"
                className="w-full"
              >
                {order.lastPaymentDate ? 'Update Payment Deadline' : 'Set Payment Deadline'}
              </Button>

              <Button
                onClick={handleCancelOrder}
                variant="secondary"
                className="w-full"
                disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
              >
                Cancel Order
              </Button>

              <Button
                onClick={handleDeleteOrder}
                variant="danger"
                className="w-full"
                disabled={order.status === 'SHIPPED'}
              >
                Delete Order
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderPage;
