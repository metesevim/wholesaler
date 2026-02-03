/**
 * RestockModal Component
 *
 * Modal for restocking inventory items
 */

import React, { useState } from 'react';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';

const RestockModal = ({ item, onConfirm, onCancel, loading }) => {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
    setError('');
  };

  const handleSubmit = () => {
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    const addedQuantity = Number(quantity);
    const newTotal = item.quantity + addedQuantity;

    onConfirm({
      addedQuantity,
      newTotal,
      unit: item.unit
    });
  };

  const addedQuantity = quantity ? Number(quantity) : 0;
  const newTotal = item.quantity + addedQuantity;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67] max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-2">Restock Item</h2>
        <p className="text-[#92adc9] text-sm mb-6">{item.name}</p>

        <div className="space-y-6">
          {/* Current Quantity */}
          <div>
            <p className="text-white font-semibold mb-2">Current Quantity</p>
            <p className="text-lg text-[#137fec] font-bold">{item.quantity} {item.unit}</p>
          </div>

          {/* Add Quantity Input */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Add Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="Enter quantity to add"
              step="0.1"
              min="0"
              error={error}
            />
          </div>

          {/* New Total */}
          <div className="bg-[#0d1117] rounded-lg p-4 border border-[#324d67]">
            <p className="text-[#92adc9] text-sm mb-2">New Total</p>
            <p className="text-2xl font-bold text-green-400">{newTotal.toFixed(1)} {item.unit}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="secondary"
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Restocking...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestockModal;
