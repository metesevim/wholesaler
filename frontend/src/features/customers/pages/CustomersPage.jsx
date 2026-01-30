/**
 * CustomersPage Component
 *
 * Page for viewing and managing customers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import { customerRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerRepository.getAllCustomers();
      if (result.success) {
        setCustomers(result.data || []);
      } else {
        setError(result.error || 'Failed to load customers');
      }
    } catch (err) {
      logger.error('Failed to load customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Customers"
          subtitle="Manage your customers"
          rightContent={
            <Button
              onClick={() => navigate(ROUTES.ADD_CUSTOMER)}
              variant="primary"
              size="md"
            >
              + Add Customer
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
            <Button onClick={loadCustomers} variant="secondary" className="mt-3">
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin">
              <svg className="w-12 h-12 text-[#137fec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="ml-4 text-white">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#92adc9] text-lg mb-4">No customers found</p>
            <Button
              onClick={() => navigate(ROUTES.ADD_CUSTOMER)}
              variant="primary"
            >
              Add Your First Customer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map(customer => (
              <div
                key={customer.id}
                className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white flex-1">
                    {customer.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`${ROUTES.CUSTOMERS}/${customer.id}/edit`)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                      variant="danger"
                      size="sm"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-[#92adc9]">
                    <span className="font-semibold">Email:</span> {customer.email}
                  </p>
                  <p className="text-[#92adc9]">
                    <span className="font-semibold">Phone:</span> {customer.phone}
                  </p>
                  {customer.city && (
                    <p className="text-[#92adc9]">
                      <span className="font-semibold">City:</span> {customer.city}
                    </p>
                  )}
                  {customer.country && (
                    <p className="text-[#92adc9]">
                      <span className="font-semibold">Country:</span> {customer.country}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  async function handleDeleteCustomer(customerId, customerName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customerName}" and all their related data? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const result = await customerRepository.deleteCustomer(customerId);
      if (result.success) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        setError(null);
      } else {
        setError(result.error || 'Failed to delete customer');
      }
    } catch (err) {
      logger.error('Failed to delete customer:', err);
      setError('Failed to delete customer. Please try again.');
    }
  }
};

export default CustomersPage;
