/**
 * AddOrderPage Component
 *
 * Page for creating a new order
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import AddOrderForm from '../components/AddOrderForm';
import { ROUTES } from '../../../shared/constants/appConstants';

const AddOrderPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSuccess = (newOrder) => {
    // Navigate back to orders page after successful creation
    navigate(ROUTES.ORDERS);
  };

  const handleGoBack = () => {
    navigate(ROUTES.ORDERS);
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.ORDERS} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Create New Order"
          subtitle="Fill in the details below to create a new order"
          rightContent={
            <Button onClick={handleGoBack} variant="secondary">
              Back to Orders
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
          <AddOrderForm
            onSuccess={handleSuccess}
            onError={setError}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderPage;
