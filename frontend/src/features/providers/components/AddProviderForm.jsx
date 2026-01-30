/**
 * AddProviderForm Component
 *
 * Form for adding a new provider
 */

import React, { useState } from 'react';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';
import { providerRepository } from '../../../data';
import logger from '../../../shared/utils/logger';

const AddProviderForm = ({ onSuccess, onError }) => {
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
      newErrors.name = 'Provider name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const providerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        iban: formData.iban,
      };

      const result = await providerRepository.createProvider(providerData);
      if (result.success) {
        onSuccess?.(result.data);
      } else {
        onError?.(result.error || 'Failed to create provider');
      }
    } catch (error) {
      logger.error('Failed to create provider:', error);
      onError?.('Failed to create provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and Email */}
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Provider Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter provider name"
            error={errors.name}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            error={errors.email}
          />
        </div>
      </div>

      {/* Phone and Address */}
      <div className="grid grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Phone
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
          />
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
            placeholder="Enter address"
          />
        </div>
      </div>

      {/* City and Country */}
      <div className="grid grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label className="block text-white font-semibold mb-2">
            City
          </label>
          <Input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Country
          </label>
          <Input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Enter country"
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
          placeholder="Enter IBAN"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Creating Provider...' : 'Add Provider'}
        </Button>
      </div>
    </form>
  );
};

export default AddProviderForm;
