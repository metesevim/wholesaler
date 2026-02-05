/**
 * AddInventoryPage Component
 *
 * Page for creating a new inventory item
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import AddInventoryForm from '../components/AddInventoryForm';
import { ROUTES } from '../../../shared/constants/appConstants';

const AddInventoryPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSuccess = () => {
    navigate(ROUTES.INVENTORY);
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.INVENTORY} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Add Inventory Item"
          subtitle="Fill in the details below to add a new inventory item"
          backButton
          onBack={() => navigate(ROUTES.INVENTORY)}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
          <AddInventoryForm
            onSuccess={handleSuccess}
            onError={setError}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryPage;
