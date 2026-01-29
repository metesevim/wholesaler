/**
 * Example: Order Management Component
 *
 * This demonstrates how to create orders using orderRepository and inventoryRepository.
 */

import React, { useState, useEffect } from 'react';
import { orderRepository, customerRepository } from '../../data';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const result = await orderRepository.getAllOrders();
    if (result.success) {
      setOrders(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const loadCustomers = async () => {
    const result = await customerRepository.getAllCustomers();
    if (result.success) {
      setCustomers(result.data);
    }
  };

  const loadAvailableItems = async (customerId) => {
    setLoading(true);
    const result = await orderRepository.getAvailableItemsForCustomer(customerId);
    if (result.success) {
      setAvailableItems(result.data.items || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    setOrderItems([]);
    if (customerId) {
      loadAvailableItems(customerId);
    } else {
      setAvailableItems([]);
    }
  };

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { adminItemId: '', quantity: 1, unit: 'piece' }
    ]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const orderData = {
      customerId: parseInt(selectedCustomerId),
      items: orderItems.map(item => ({
        adminItemId: parseInt(item.adminItemId),
        quantity: parseFloat(item.quantity),
        unit: item.unit
      })),
      notes
    };

    const result = await orderRepository.createOrder(orderData);

    if (result.success) {
      alert('Order created successfully!');
      await loadOrders();
      setShowCreateForm(false);
      setSelectedCustomerId('');
      setOrderItems([]);
      setNotes('');
      setAvailableItems([]);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const result = await orderRepository.cancelOrder(orderId);
      if (result.success) {
        alert('Order cancelled successfully!');
        await loadOrders();
      } else {
        alert('Failed to cancel order: ' + result.error);
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const result = await orderRepository.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      alert('Status updated successfully!');
      await loadOrders();
    } else {
      alert('Failed to update status: ' + result.error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showCreateForm ? 'Cancel' : 'Create Order'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
          <form onSubmit={handleCreateOrder}>
            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={handleCustomerSelect}
                required
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
              >
                <option value="">-- Select Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Items */}
            {selectedCustomerId && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-bold">
                      Order Items *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      + Add Item
                    </button>
                  </div>

                  {orderItems.length === 0 && (
                    <p className="text-gray-500 text-sm">No items added yet. Click "Add Item" to start.</p>
                  )}

                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={item.adminItemId}
                        onChange={(e) => handleItemChange(index, 'adminItemId', e.target.value)}
                        required
                        className="flex-1 shadow border rounded py-2 px-3 text-gray-700"
                      >
                        <option value="">-- Select Item --</option>
                        {availableItems.map(availItem => (
                          <option key={availItem.id} value={availItem.id}>
                            {availItem.name} (Stock: {availItem.currentStock} {availItem.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="Quantity"
                        className="w-32 shadow border rounded py-2 px-3 text-gray-700"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-32 shadow border rounded py-2 px-3 text-gray-700"
                      >
                        <option value="piece">Piece</option>
                        <option value="kg">Kg</option>
                        <option value="liter">Liter</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="bg-red-500 text-white px-3 py-2 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                    placeholder="Optional order notes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || orderItems.length === 0}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Order'}
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* Orders List */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No orders found. Create your first order!</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="bg-white shadow-md rounded overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.customer?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-900 mr-2">
                      View
                    </button>
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

