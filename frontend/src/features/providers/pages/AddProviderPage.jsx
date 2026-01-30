/**
 * AddProviderPage Component
 *
 * Page for creating a new provider
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import AddProviderForm from '../components/AddProviderForm';
import { ROUTES } from '../../../shared/constants/appConstants';

const AddProviderPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSuccess = (newProvider) => {
    navigate(ROUTES.PROVIDERS);
  };

  const handleGoBack = () => {
    navigate(ROUTES.PROVIDERS);
  };

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Add Provider"
          subtitle="Fill in the details below to add a new provider"
          rightContent={
            <Button onClick={handleGoBack} variant="secondary">
              Back to Providers
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
          <AddProviderForm
            onSuccess={handleSuccess}
            onError={setError}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProviderPage;
