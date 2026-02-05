/**
 * AddOrderForm Component
 *
 * Form for creating a new order with customer selection and item management
 */

import React, { useState, useEffect, useCallback } from 'react';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';
import { orderRepository, customerRepository, inventoryRepository } from '../../../data';
import { formatDateToEuropean } from '../../../shared/utils/dateFormatter';
import logger from '../../../shared/utils/logger';

const AddOrderForm = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [paymentDeadlineDate, setPaymentDeadlineDate] = useState(() => {
    // Default to 30 days from today in YYYY-MM-DD format (for input type="date")
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [errors, setErrors] = useState({});
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('piece');
  const [insufficientStockWarning, setInsufficientStockWarning] = useState(null);
  const [pendingItemToAdd, setPendingItemToAdd] = useState(null);

  // Load customers on component mount
  const loadCustomers = useCallback(async () => {
    try {
      const result = await customerRepository.getAllCustomers();
      if (result.success) {
        setCustomers(result.data);
      } else {
        onError?.(result.error);
      }
    } catch (error) {
      logger.error('Failed to load customers:', error);
      onError?.('Failed to load customers');
    }
  }, [onError]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const loadAvailableItems = async () => {
    try {
      const result = await inventoryRepository.getAllItems();
      if (result.success) {
        setAvailableItems(result.data || []);
      } else {
        logger.error('Failed to load available items:', result.error);
      }
    } catch (error) {
      logger.error('Failed to load available items:', error);
    }
  };

  // Load all available items on component mount
  useEffect(() => {
    loadAvailableItems();
  }, []);

  // Clear order items when customer is deselected
  useEffect(() => {
    if (!selectedCustomerId) {
      setOrderItems([]);
    }
  }, [selectedCustomerId]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCustomerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (orderItems.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    const newErrors = {};

    if (!selectedItemId) {
      newErrors.itemId = 'Item is required';
    }

    if (!selectedQuantity || parseFloat(selectedQuantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const item = availableItems.find(i => i.id === parseInt(selectedItemId));
    if (!item) {
      setErrors({ itemId: 'Selected item not found' });
      return;
    }

    // Check if quantity exceeds available stock
    const requestedQuantity = parseFloat(selectedQuantity);
    if (requestedQuantity > item.quantity) {
      // Show warning with override button instead of blocking
      setInsufficientStockWarning({
        itemName: item.name,
        available: item.quantity,
        unit: item.unit,
        requested: requestedQuantity,
        requestedUnit: selectedUnit,
      });
      setPendingItemToAdd({
        adminItemId: parseInt(selectedItemId),
        itemName: item.name,
        quantity: requestedQuantity,
        unit: selectedUnit,
        availableQuantity: item.quantity,
        price: item.pricePerUnit || 0,
        category: item.category || null
      });
      return;
    }

    // Check for duplicate items
    const isDuplicate = orderItems.some(oi => oi.adminItemId === parseInt(selectedItemId));
    if (isDuplicate) {
      setErrors({ itemId: 'This item is already added to the order' });
      return;
    }

    addItemToOrder({
      adminItemId: parseInt(selectedItemId),
      itemName: item.name,
      quantity: requestedQuantity,
      unit: selectedUnit,
      availableQuantity: item.quantity,
      price: item.pricePerUnit || 0,
      category: item.category || null
    });
  };

  const addItemToOrder = (newItem) => {
    setOrderItems([...orderItems, newItem]);
    setSelectedItemId('');
    setSelectedQuantity('');
    setSelectedUnit('piece');
    setErrors({});
    setInsufficientStockWarning(null);
    setPendingItemToAdd(null);
  };

  const handleOverrideStockWarning = () => {
    if (pendingItemToAdd) {
      // Check for duplicate items
      const isDuplicate = orderItems.some(oi => oi.adminItemId === pendingItemToAdd.adminItemId);
      if (isDuplicate) {
        setErrors({ itemId: 'This item is already added to the order' });
        setInsufficientStockWarning(null);
        setPendingItemToAdd(null);
        return;
      }

      addItemToOrder(pendingItemToAdd);
    }
  };

  const handleCancelStockWarning = () => {
    setInsufficientStockWarning(null);
    setPendingItemToAdd(null);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Sort items by category priority (lower priority number = higher in list)
  const getSortedOrderItems = () => {
    return [...orderItems].sort((a, b) => {
      const categoryA = a.category;
      const categoryB = b.category;

      // If either has no category, sort to end
      if (!categoryA && !categoryB) return 0;
      if (!categoryA) return 1;
      if (!categoryB) return -1;

      // Sort by category priority (ascending)
      return (categoryA.priority || 0) - (categoryB.priority || 0);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Use the selected payment deadline date
      const deadline = new Date(paymentDeadlineDate);
      deadline.setHours(23, 59, 59, 999); // Set to end of day

      const orderData = {
        customerId: parseInt(selectedCustomerId),
        items: orderItems.map(item => ({
          adminItemId: item.adminItemId,
          quantity: item.quantity,
          unit: item.unit
        })),
        notes: notes || undefined,
        lastPaymentDate: deadline.toISOString()
      };

      logger.info('Creating order:', orderData);
      const result = await orderRepository.createOrder(orderData);

      if (result.success) {
        onSuccess?.(result.data);
      } else {
        onError?.(result.error);
      }
    } catch (error) {
      logger.error('Failed to create order:', error);
      onError?.('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className="block text-white font-semibold mb-3">
          Select Customer <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className={`
            w-full h-12 rounded-lg border bg-[#192633] text-white pl-3
            focus:outline-none focus:border-[#137fec]
            ${errors.customerId ? 'border-red-500' : 'border-[#324d67]'}
          `}
        >
          <option value="">-- Choose a customer --</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} (ID: {customer.id})
            </option>
          ))}
        </select>
        {errors.customerId && (
          <p className="mt-1 text-sm text-red-400">{errors.customerId}</p>
        )}
      </div>

      {/* Items Selection */}
      <div className="border-t border-[#324d67] pt-6">
        <h3 className="text-xl font-bold text-white mb-4">Add Items to Order</h3>

        {!selectedCustomerId && (
          <p className="text-[#92adc9] mb-4">Please select a customer first to add items</p>
        )}

        {/* Insufficient Stock Warning */}
        {insufficientStockWarning && (
          <div className="mb-6 p-4 bg-yellow-900 border border-yellow-500 rounded-lg">
            <p className="text-yellow-200 font-semibold mb-2">
              ⚠️ Insufficient Stock Warning
            </p>
            <p className="text-yellow-200 mb-4">
              You are requesting <strong>{insufficientStockWarning.requested} {insufficientStockWarning.requestedUnit}</strong>,
              but only <strong>{insufficientStockWarning.available} {insufficientStockWarning.unit}</strong> of <strong>{insufficientStockWarning.itemName}</strong> is available.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleOverrideStockWarning}
                variant="primary"
              >
                Override & Add Item
              </Button>
              <Button
                type="button"
                onClick={handleCancelStockWarning}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Item Selection */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              disabled={!selectedCustomerId}
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                // Auto-populate unit based on selected item
                if (e.target.value) {
                  const selectedItem = availableItems.find(i => i.id === parseInt(e.target.value));
                  if (selectedItem && selectedItem.unit) {
                    setSelectedUnit(selectedItem.unit);
                  }
                }
              }}
              className={`
                w-full h-12 rounded-lg border bg-[#192633] text-white pl-3
                focus:outline-none focus:border-[#137fec]
                ${!selectedCustomerId ? 'opacity-50 cursor-not-allowed' : ''}
                ${errors.itemId ? 'border-red-500' : 'border-[#324d67]'}
              `}
            >
              <option value="">-- Choose a product --</option>
              {availableItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Available: {item.quantity} {item.unit})
                </option>
              ))}
            </select>
            {errors.itemId && (
              <p className="mt-1 text-sm text-red-400">{errors.itemId}</p>
            )}
          </div>

          {/* Quantity Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                disabled={!selectedCustomerId}
                type="number"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                placeholder="Enter quantity"
                step="0.1"
                min="0"
                error={errors.quantity}
              />
            </div>

            {/* Unit Selection */}
            <div>
              <label className="block text-white font-semibold mb-2">Unit</label>
              <select
                disabled={!selectedCustomerId}
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className={`
                  w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white pl-3
                  focus:outline-none focus:border-[#137fec]
                  ${!selectedCustomerId ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <option value="piece">Piece</option>
                <option value="kg">KG</option>
                <option value="liter">Liter</option>
              </select>
            </div>
          </div>

          {/* Add Item Button */}
          <Button
            type="button"
            onClick={handleAddItem}
            variant="secondary"
            disabled={!selectedCustomerId}
            className="w-full"
          >
            + Add Item to Order
          </Button>
        </div>

        {/* Added Items List */}
        {orderItems.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">Order Items (Sorted by Pickup Order)</h4>
            <div className="space-y-2 bg-[#101922] rounded-lg p-4 border border-[#324d67]">
              {getSortedOrderItems().map((item) => (
                <div key={item.adminItemId} className="flex items-center justify-between p-3 bg-[#192633] rounded border border-[#324d67]">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold">{item.itemName}</p>
                      {item.category && (
                        <span className="text-xs px-2 py-1 rounded bg-[#137fec]/20 text-[#137fec]">
                          {item.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#92adc9]">
                      Quantity: {item.quantity} {item.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(orderItems.findIndex(oi => oi.adminItemId === item.adminItemId))}
                    className="ml-4 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.items && (
          <p className="mt-2 text-sm text-red-400">{errors.items}</p>
        )}
      </div>

      {/* Notes */}
      <div className="border-t border-[#324d67] pt-6 space-y-4">
        {/* Payment Deadline Calendar */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Payment Deadline <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={paymentDeadlineDate}
            onChange={(e) => setPaymentDeadlineDate(e.target.value)}
            disabled={!selectedCustomerId}
            min={new Date().toISOString().split('T')[0]}
            className={`
              w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 py-2
              focus:outline-none focus:border-[#137fec]
              ${!selectedCustomerId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          />
          <p className="text-xs text-[#92adc9] mt-2">
            Selected deadline: <span className="font-semibold">{formatDateToEuropean(paymentDeadlineDate)}</span>
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-white font-semibold mb-3">
            Order Notes (Optional)
          </label>
          <textarea
            disabled={!selectedCustomerId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special notes for this order..."
            rows="4"
            className={`
              w-full rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 py-3
              placeholder-[#92adc9] focus:outline-none focus:border-[#137fec]
              ${!selectedCustomerId ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6 border-t border-[#324d67]">
        <Button
          type="submit"
          loading={loading}
          disabled={loading || !selectedCustomerId || orderItems.length === 0}
          className="flex-1"
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
};

export default AddOrderForm;
