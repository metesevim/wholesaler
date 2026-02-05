/**
 * AddInventoryForm Component
 *
 * Form for adding a new inventory item
 */

import React, { useState, useEffect } from 'react';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';
import { inventoryRepository, providerRepository } from '../../../data';
import logger from '../../../shared/utils/logger';

const AddInventoryForm = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    price: '',
    lowStockAlert: 20,
    providerId: '',
    productionDate: '',
    expiryDate: '',
  });
  const [errors, setErrors] = useState({});

  // Load providers on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const result = await providerRepository.getAllProviders();
        if (result.success) {
          setProviders(result.data || []);
        }
      } catch (error) {
        logger.error('Failed to load providers:', error);
      } finally {
        setLoadingProviders(false);
      }
    };

    loadProviders();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.lowStockAlert) {
      newErrors.lowStockAlert = 'Low stock alert threshold is required';
    } else if (isNaN(formData.lowStockAlert) || Number(formData.lowStockAlert) < 0) {
      newErrors.lowStockAlert = 'Low stock alert must be a non-negative number';
    }

    if (!formData.providerId) {
      newErrors.providerId = 'Provider is required';
    }

    if (!formData.productionDate) {
      newErrors.productionDate = 'Production date is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
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
        pricePerUnit: parseFloat(formData.price),
        lowStockAlert: Number(formData.lowStockAlert),
        providerId: parseInt(formData.providerId),
        productionDate: formData.productionDate,
        expiryDate: formData.expiryDate,
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
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter item description"
          rows="4"
          className={`w-full rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 py-3
            placeholder-[#92adc9] focus:outline-none focus:border-[#137fec] ${
            errors.description ? 'border-red-500' : ''
          }`}
        />
        {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
      </div>

      {/* Quantity */}
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

      {/* Provider */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Provider <span className="text-red-500">*</span>
        </label>
        <select
          name="providerId"
          value={formData.providerId}
          onChange={handleInputChange}
          disabled={loadingProviders}
          className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
            focus:outline-none focus:border-[#137fec] disabled:opacity-50 ${
            errors.providerId ? 'border-red-500' : ''
          }`}
        >
          <option value="">Select a provider</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        {loadingProviders && (
          <p className="text-xs text-[#92adc9] mt-2">Loading providers...</p>
        )}
        {errors.providerId && <p className="mt-2 text-sm text-red-400">{errors.providerId}</p>}
      </div>

      {/* Low Stock Alert Threshold */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Low Stock Alert Threshold <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          name="lowStockAlert"
          value={formData.lowStockAlert}
          onChange={handleInputChange}
          placeholder="Set minimum quantity before alert"
          step="1"
          min="0"
          error={errors.lowStockAlert}
        />
        <p className="text-xs text-[#92adc9] mt-2">
          When quantity drops below this number, it will appear in the Low Stock Alert section on the homepage
        </p>
      </div>

      {/* Production and Expiry Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-semibold mb-2">
            Production Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="productionDate"
            value={formData.productionDate}
            onChange={handleInputChange}
            className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
              focus:outline-none focus:border-[#137fec] ${
              errors.productionDate ? 'border-red-500' : ''
            }`}
          />
          {errors.productionDate && <p className="mt-2 text-sm text-red-400">{errors.productionDate}</p>}
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
              focus:outline-none focus:border-[#137fec] ${
              errors.expiryDate ? 'border-red-500' : ''
            }`}
          />
          {errors.expiryDate && <p className="mt-2 text-sm text-red-400">{errors.expiryDate}</p>}
        </div>
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
