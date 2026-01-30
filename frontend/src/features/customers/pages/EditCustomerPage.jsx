/**
 * EditCustomerPage Component
 *
 * Page for editing an existing customer
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import Input from '../../../components/forms/Input';
import PageHeader from '../../../components/layout/PageHeader';
import { customerRepository, inventoryRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const EditCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    iban: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load customer data
      const customerResult = await customerRepository.getCustomerById(parseInt(id));
      if (customerResult.success) {
        setFormData({
          name: customerResult.data.name || '',
          email: customerResult.data.email || '',
          phone: customerResult.data.phone || '',
          address: customerResult.data.address || '',
          city: customerResult.data.city || '',
          country: customerResult.data.country || '',
          iban: customerResult.data.iban || '',
        });
      } else {
        setError('Failed to load customer');
        setLoading(false);
        return;
      }

      // Load available items
      const itemsResult = await inventoryRepository.getAllItems();
      if (itemsResult.success) {
        setAvailableItems(itemsResult.data || []);
      }

      // DEACTIVATED: Load customer's inventory items and match with available items
      // try {
      //   const inventoryResult = await customerRepository.getCustomerInventory(parseInt(id));
      //   if (inventoryResult.success && inventoryResult.data && inventoryResult.data.length > 0) {
      //     const itemIds = new Set();
      //     inventoryResult.data.forEach(customerItem => {
      //       const itemId = customerItem.adminItemId || customerItem.id;
      //       if (itemId) {
      //         itemIds.add(itemId);
      //       }
      //     });
      //     setSelectedItems(itemIds);
      //   }
      // } catch (err) {
      //   logger.warn('Failed to load customer inventory items:', err);
      // }
    } catch (err) {
      logger.error('Failed to load data:', err);
      setError('Failed to load customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    try {
      const result = await customerRepository.updateCustomer(parseInt(id), formData);
      if (result.success) {
        // Save selected items to customer inventory
        const selectedItemIds = Array.from(selectedItems);
        if (selectedItemIds.length > 0) {
          try {
            await customerRepository.addItemsToInventory(parseInt(id), selectedItemIds);
          } catch (err) {
            logger.warn('Failed to save inventory items:', err);
          }
        }

        setSuccess('Customer updated successfully!');
        setTimeout(() => {
          navigate(ROUTES.CUSTOMERS);
        }, 1500);
      } else {
        setError(result.error || 'Failed to update customer');
      }
    } catch (err) {
      logger.error('Failed to update customer:', err);
      setError('Failed to update customer. Please try again.');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${formData.name}" and all their related data? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const result = await customerRepository.deleteCustomer(parseInt(id));
      if (result.success) {
        setSuccess('Customer deleted successfully!');
        setTimeout(() => {
          navigate(ROUTES.CUSTOMERS);
        }, 1500);
      } else {
        setError(result.error || 'Failed to delete customer');
      }
    } catch (err) {
      logger.error('Failed to delete customer:', err);
      setError('Failed to delete customer. Please try again.');
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
          <p className="ml-4 text-white">Loading customer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Edit Customer"
          subtitle="Update customer information"
          backButton
          onBack={() => navigate(ROUTES.CUSTOMERS)}
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
          <h2 className="text-2xl font-bold text-white mb-6">Customer Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email */}
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Phone and Address */}
            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Address
                </label>
                <Input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* City and Country */}
            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  City
                </label>
                <Input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Country
                </label>
                <Input
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* IBAN */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                IBAN
              </label>
              <Input
                name="iban"
                type="text"
                value={formData.iban}
                onChange={handleChange}
                placeholder="Enter IBAN"
              />
            </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-8 pt-6">
                <Button type="submit" variant="primary" className="flex-1">
                  Update Customer
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                >
                  Delete Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default EditCustomerPage;
