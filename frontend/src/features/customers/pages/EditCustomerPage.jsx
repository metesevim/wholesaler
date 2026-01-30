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
import { customerRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const EditCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerRepository.getCustomerById(parseInt(id));
      if (result.success) {
        setFormData({
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          address: result.data.address || '',
          city: result.data.city || '',
          country: result.data.country || '',
          iban: result.data.iban || '',
        });
      } else {
        setError('Failed to load customer');
      }
    } catch (err) {
      logger.error('Failed to load customer:', err);
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
      <div className="max-w-2xl mx-auto">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <Input
              label="Customer Name *"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />

            {/* Email */}
            <Input
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />

            {/* Phone */}
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />

            {/* Address */}
            <Input
              label="Address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />

            {/* City */}
            <Input
              label="City"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
            />

            {/* Country */}
            <Input
              label="Country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter country"
            />

            {/* IBAN */}
            <Input
              label="IBAN"
              name="iban"
              type="text"
              value={formData.iban}
              onChange={handleChange}
              placeholder="Enter IBAN"
            />

            {/* Form Actions */}
            <div className="flex gap-4 mt-8">
              <Button type="submit" variant="primary" className="flex-1">
                Update Customer
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(ROUTES.CUSTOMERS)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Delete Section */}
          <div className="mt-8 pt-8 border-t border-[#324d67]">
            <h3 className="text-lg font-bold text-red-400 mb-4">Caution!</h3>
            <p className="text-[#92adc9] text-sm mb-4">
              Once you delete a customer, there is no going back. Please be certain.
            </p>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
            >
              Delete Customer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerPage;
