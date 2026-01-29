/**
 * AddCustomerPage Component
 *
 * Page for creating a new customer
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import AddCustomerForm from '../components/AddCustomerForm';
import { ROUTES } from '../../../shared/constants/appConstants';

const AddCustomerPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSuccess = (newCustomer) => {
    navigate(ROUTES.CUSTOMERS);
  };

  const handleGoBack = () => {
    navigate(ROUTES.CUSTOMERS);
  };

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Add Customer"
          subtitle="Fill in the details below to add a new customer"
          rightContent={
            <Button onClick={handleGoBack} variant="secondary">
              Back to Customers
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
          <AddCustomerForm
            onSuccess={handleSuccess}
            onError={setError}
          />
        </div>
      </div>
    </div>
  );
};

export default AddCustomerPage;
