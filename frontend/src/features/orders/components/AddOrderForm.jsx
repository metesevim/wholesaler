/**
 * AddOrderForm Component
 *
 * Form for creating a new order with customer selection and item management
 */

import React, { useState, useEffect, useCallback } from 'react';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';
import { orderRepository, customerRepository } from '../../../data';
import logger from '../../../shared/utils/logger';

const AddOrderForm = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('piece');

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

  const loadAvailableItems = async (customerId) => {
    try {
      const result = await orderRepository.getAvailableItemsForCustomer(customerId);
      if (result.success) {
        setAvailableItems(result.data.items || []);
      } else {
        logger.error('Failed to load available items:', result.error);
      }
    } catch (error) {
      logger.error('Failed to load available items:', error);
    }
  };

  // Load available items when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      loadAvailableItems(selectedCustomerId);
    } else {
      setAvailableItems([]);
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

    // Check for duplicate items
    const isDuplicate = orderItems.some(oi => oi.adminItemId === parseInt(selectedItemId));
    if (isDuplicate) {
      setErrors({ itemId: 'This item is already added to the order' });
      return;
    }

    const newItem = {
      adminItemId: parseInt(selectedItemId),
      itemName: item.name,
      quantity: parseFloat(selectedQuantity),
      unit: selectedUnit,
      availableQuantity: item.quantity,
      price: item.price || 0
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedItemId('');
    setSelectedQuantity('');
    setSelectedUnit('piece');
    setErrors({});
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: parseInt(selectedCustomerId),
        items: orderItems.map(item => ({
          adminItemId: item.adminItemId,
          quantity: item.quantity,
          unit: item.unit
        })),
        notes: notes || undefined
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
            w-full h-12 rounded-lg border bg-[#192633] text-white px-4
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

        <div className="space-y-4 mb-6">
          {/* Item Selection */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              disabled={!selectedCustomerId}
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className={`
                w-full h-12 rounded-lg border bg-[#192633] text-white px-4
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
                  w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
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
            <h4 className="text-lg font-semibold text-white mb-3">Order Items</h4>
            <div className="space-y-2 bg-[#101922] rounded-lg p-4 border border-[#324d67]">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#192633] rounded border border-[#324d67]">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{item.itemName}</p>
                    <p className="text-sm text-[#92adc9]">
                      Quantity: {item.quantity} {item.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
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
      <div className="border-t border-[#324d67] pt-6">
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
