/**
 * EditInventoryPage Component
 *
 * Page for editing an existing inventory item
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import Input from '../../../components/forms/Input';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import { inventoryRepository, categoryRepository, providerRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const EditInventoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [item, setItem] = useState(null);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    price: '',
    minimumCapacity: 20,
    maximumCapacity: 100,
    providerId: '',
    productionDate: '',
    expiryDate: '',
    category: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadItem();
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [providersResult, categoriesResult] = await Promise.all([
        providerRepository.getAllProviders(),
        categoryRepository.getAllCategories(),
      ]);

      if (providersResult.success) {
        setProviders(providersResult.data || []);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data || []);
      }
    } catch (error) {
      logger.error('Failed to load data:', error);
    } finally {
      setLoadingProviders(false);
      setLoadingCategories(false);
    }
  };

  const loadItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inventoryRepository.getItemById(parseInt(id));
      if (result.success) {
        setItem(result.data);
        // Pre-fill form with current data
        setFormData({
          name: result.data.name || '',
          description: result.data.description || '',
          quantity: result.data.quantity || '',
          price: result.data.pricePerUnit || '',
          minimumCapacity: result.data.minimumCapacity || 20,
          maximumCapacity: result.data.maximumCapacity || 100,
          providerId: result.data.providerId || '',
          productionDate: result.data.productionDate ? result.data.productionDate.split('T')[0] : '',
          expiryDate: result.data.expiryDate ? result.data.expiryDate.split('T')[0] : '',
          category: result.data.category || '',
        });
      } else {
        setError('Failed to load inventory item');
      }
    } catch (err) {
      logger.error('Failed to load inventory item:', err);
      setError('Failed to load inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.minimumCapacity) {
      newErrors.minimumCapacity = 'Minimum capacity is required';
    } else if (isNaN(formData.minimumCapacity) || Number(formData.minimumCapacity) < 0) {
      newErrors.minimumCapacity = 'Minimum capacity must be a non-negative number';
    }

    if (!formData.maximumCapacity) {
      newErrors.maximumCapacity = 'Maximum capacity is required';
    } else if (isNaN(formData.maximumCapacity) || Number(formData.maximumCapacity) <= 0) {
      newErrors.maximumCapacity = 'Maximum capacity must be a positive number';
    }

    if (Number(formData.minimumCapacity) >= Number(formData.maximumCapacity)) {
      newErrors.minimumCapacity = 'Minimum capacity must be less than maximum capacity';
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

    if (!formData.category) {
      newErrors.category = 'Category is required';
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

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        quantity: Number(formData.quantity),
        pricePerUnit: parseFloat(formData.price),
        minimumCapacity: Number(formData.minimumCapacity),
        maximumCapacity: Number(formData.maximumCapacity),
        providerId: parseInt(formData.providerId),
        productionDate: formData.productionDate,
        expiryDate: formData.expiryDate,
        categoryId: formData.category ? parseInt(formData.category) : null,
      };

      logger.info('Submitting item data:', itemData);

      const result = await inventoryRepository.updateItem(parseInt(id), itemData);

      if (result.success) {
        setSuccess('Inventory item updated successfully!');
        setTimeout(() => {
          navigate(ROUTES.INVENTORY);
        }, 1500);
      } else {
        setError(result.error || 'Failed to update inventory item');
      }
    } catch (err) {
      logger.error('Failed to update inventory item:', err);
      setError('Failed to update inventory item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await inventoryRepository.deleteItem(parseInt(id));

      if (result.success) {
        setSuccess('Inventory item deleted successfully!');
        setTimeout(() => {
          navigate(ROUTES.INVENTORY);
        }, 1500);
      } else {
        setError(result.error || 'Failed to delete inventory item');
      }
    } catch (err) {
      logger.error('Failed to delete inventory item:', err);
      setError('Failed to delete inventory item. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <p className="ml-4 text-white">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#101922] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">Item not found</p>
            <Button onClick={() => navigate(ROUTES.INVENTORY)} variant="primary">
              Back to Inventory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.INVENTORY} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
        <PageHeader
            title={`Edit Item: ${item.name}`}
            subtitle="Update the details of your inventory item"
            backButton
            onBack={() => navigate(ROUTES.INVENTORY)}
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

        <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name and Provider - 2 Columns */}
            <div className="grid grid-cols-2 gap-4">
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
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Provider <span className="text-red-500">*</span>
                </label>
                <select
                  name="providerId"
                  value={formData.providerId}
                  onChange={handleInputChange}
                  disabled={submitting || loadingProviders}
                  className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white pl-3
                    focus:outline-none focus:border-[#137fec] disabled:opacity-50 ${
                    errors.providerId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {loadingProviders && (
                  <p className="text-xs text-[#92adc9] mt-2">Loading...</p>
                )}
                {errors.providerId && <p className="mt-2 text-xs text-red-400">{errors.providerId}</p>}
              </div>
            </div>

            {/* Description - Full Width */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter item description"
                rows="3"
                disabled={submitting}
                className={`w-full rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 py-3
                  placeholder-[#92adc9] focus:outline-none focus:border-[#137fec] disabled:opacity-50 ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
            </div>

            {/* Quantity, Price, Low Stock Alert - 3 Columns */}
            <div className="grid grid-cols-3 gap-4">
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
                  disabled={submitting}
                />
              </div>

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
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Min Capacity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="minimumCapacity"
                  value={formData.minimumCapacity}
                  onChange={handleInputChange}
                  placeholder="Minimum stock level"
                  step="1"
                  min="0"
                  error={errors.minimumCapacity}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Max Capacity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="maximumCapacity"
                  value={formData.maximumCapacity}
                  onChange={handleInputChange}
                  placeholder="Maximum stock level"
                  step="1"
                  min="1"
                  error={errors.maximumCapacity}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Production and Expiry Dates and Category - 3 Columns */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Production Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="productionDate"
                  value={formData.productionDate}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
                    focus:outline-none focus:border-[#137fec] disabled:opacity-50 ${
                    errors.productionDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.productionDate && <p className="mt-2 text-xs text-red-400">{errors.productionDate}</p>}
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
                  disabled={submitting}
                  className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
                    focus:outline-none focus:border-[#137fec] disabled:opacity-50 ${
                    errors.expiryDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.expiryDate && <p className="mt-2 text-xs text-red-400">{errors.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={submitting || loadingCategories}
                  className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white pl-3
                    focus:outline-none focus:border-[#137fec] disabled:opacity-50 ${
                    errors.category ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <p className="text-xs text-[#92adc9] mt-2">Loading...</p>
                )}
                {errors.category && <p className="mt-2 text-xs text-red-400">{errors.category}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-[#324d67]">
              <Button
                type="submit"
                loading={submitting}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteItem}
                disabled={submitting}
              >
                Delete Item
              </Button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryPage;
