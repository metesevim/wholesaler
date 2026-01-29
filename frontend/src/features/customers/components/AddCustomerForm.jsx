/**
 * AddCustomerForm Component
 *
 * Form for adding a new customer
 */

import React, { useState } from 'react';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';
import { customerRepository } from '../../../data';
import logger from '../../../shared/utils/logger';

const AddCustomerForm = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    iban: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
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
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || null,
        city: formData.city,
        country: formData.country || null,
        iban: formData.iban || null,
      };

      const result = await customerRepository.createCustomer(customerData);

      if (result.success) {
        onSuccess?.(result.data);
      } else {
        onError?.(result.error || 'Failed to create customer');
      }
    } catch (error) {
      logger.error('Failed to create customer:', error);
      onError?.('Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Name */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Customer Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter customer name"
          error={errors.name}
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-semibold mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            error={errors.email}
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            error={errors.phone}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Address
        </label>
        <Input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter address (optional)"
        />
      </div>

      {/* City and Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-semibold mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            error={errors.city}
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            Country
          </label>
          <Input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Enter country (optional)"
          />
        </div>
      </div>

      {/* IBAN */}
      <div>
        <label className="block text-white font-semibold mb-2">
          IBAN
        </label>
        <Input
          type="text"
          name="iban"
          value={formData.iban}
          onChange={handleInputChange}
          placeholder="Enter IBAN (optional)"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6 border-t border-[#324d67]">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Creating Customer...' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
};

export default AddCustomerForm;
