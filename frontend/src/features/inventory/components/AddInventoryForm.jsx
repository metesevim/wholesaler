/**
 * AddInventoryForm Component
 *
 * Form for adding a new inventory item
 */

import React, { useState } from 'react';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';
import { inventoryRepository } from '../../../data';
import logger from '../../../shared/utils/logger';

const AddInventoryForm = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'piece',
    price: '',
    lowStockAlert: 20,
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.price),
        lowStockAlert: Number(formData.lowStockAlert) || 20,
      };

      console.log('Creating item with data:', itemData);

      const result = await inventoryRepository.createItem(itemData);

      if (result.success) {
        onSuccess?.(result.data);
      } else {
        onError?.(result.error || 'Failed to create inventory item');
      }
    } catch (error) {
      logger.error('Failed to create inventory item:', error);
      onError?.('Failed to create inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Item Name */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Item Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter item name"
          error={errors.name}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter item description (optional)"
          rows="4"
          className="w-full rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 py-3
            placeholder-[#92adc9] focus:outline-none focus:border-[#137fec]"
        />
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-semibold mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            step="0.1"
            min="0"
            error={errors.quantity}
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            className="w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
              focus:outline-none focus:border-[#137fec]"
          >
            <option value="piece">Piece</option>
            <option value="kg">KG</option>
            <option value="liter">Liter</option>
            <option value="box">Box</option>
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Price <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Enter price"
          step="0.01"
          min="0"
          error={errors.price}
        />
      </div>

      {/* Low Stock Alert Threshold */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Low Stock Alert Threshold
        </label>
        <Input
          type="number"
          name="lowStockAlert"
          value={formData.lowStockAlert}
          onChange={handleInputChange}
          placeholder="Set minimum quantity before alert"
          step="1"
          min="0"
        />
        <p className="text-xs text-[#92adc9] mt-2">
          When quantity drops below this number, it will appear in the Low Stock Alert section on the homepage
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6 border-t border-[#324d67]">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Creating Item...' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
};

export default AddInventoryForm;
