/**
 * ProvidersPage Component
 *
 * Page for viewing and managing providers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import { providerRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const ProvidersPage = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await providerRepository.getAllProviders();
      if (result.success) {
        setProviders(result.data || []);
      } else {
        setError(result.error || 'Failed to load providers');
      }
    } catch (err) {
      logger.error('Failed to load providers:', err);
      setError('Failed to load providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async (providerId, providerName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${providerName}" and all their related data? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const result = await providerRepository.deleteProvider(providerId);
      if (result.success) {
        setProviders(providers.filter(p => p.id !== providerId));
      } else {
        setError(result.error || 'Failed to delete provider');
      }
    } catch (err) {
      logger.error('Failed to delete provider:', err);
      setError('Failed to delete provider. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Providers"
          subtitle="Manage your providers"
          rightContent={
            <Button
              onClick={() => navigate(ROUTES.ADD_PROVIDER)}
              variant="primary"
              size="md"
            >
              + Add Provider
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
            <Button onClick={loadProviders} variant="secondary" className="mt-3">
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
            <p className="ml-4 text-white">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#92adc9] text-lg mb-4">No providers found</p>
            <Button
              onClick={() => navigate(ROUTES.ADD_PROVIDER)}
              variant="primary"
            >
              Add Your First Provider
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(provider => (
              <div
                key={provider.id}
                className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white flex-1">
                    {provider.name}
                  </h3>

                  <div className="flex gap-2">
                    {provider.iban && (
                      <Button
                        onClick={() => {navigator.clipboard.writeText(provider.iban);
                          alert('IBAN copied to clipboard!');
                        }}
                        variant="primary"
                        size="sm"
                      >
                        Copy IBAN
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate(`${ROUTES.PROVIDERS}/${provider.id}/edit`)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>

                  </div>
                </div>
                <div className="text-sm">
                  <div className="border-t border-[#324d67] my-2"></div>
                  <p className="text-[#92adc9] mb-2">
                    <span className="font-semibold">Email:</span> {provider.email || 'N/A'}
                  </p>
                  <p className="text-[#92adc9] mb-2">
                    <span className="font-semibold">Phone:</span> {provider.phone || 'N/A'}
                  </p>
                  <div className="border-t border-[#324d67] my-2"></div>
                  {provider.address && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">Address:</span> {provider.address}
                    </p>
                  )}
                  {provider.city && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">City:</span> {provider.city}
                    </p>
                  )}
                  {provider.country && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">Country:</span> {provider.country}
                    </p>
                  )}
                  <div className="border-t border-[#324d67] my-2"></div>
                  {provider.iban && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">IBAN:</span> {provider.iban}
                    </p>
                  )}
                  {!provider.iban && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">IBAN:</span> N/A
                    </p>
                  )}
                  {provider.createdAt && (
                    <>
                      <div className="border-t border-[#324d67] my-2"></div>
                      <p className="text-[#92adc9]">
                        <span className="font-semibold">Provider since:</span> {new Date(provider.createdAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvidersPage;
