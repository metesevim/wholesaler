/**
 * ProvidersPage Component
 *
 * Page for viewing and managing providers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import TopBar from '../../../components/layout/TopBar';
import useAuth from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../shared/constants/appConstants';
import { formatDateToEuropean } from '../../../shared/utils/dateFormatter';
import logger from '../../../shared/utils/logger';
import { providerRepository } from '../../../data';

const ProvidersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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


  // Filter providers based on search term and sort alphabetically
  const filteredProviders = providers
    .filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.email && provider.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (provider.phone && provider.phone.includes(searchTerm)) ||
      (provider.city && provider.city.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.PROVIDERS} />
      <div className="flex-1 flex flex-col">
        <TopBar user={user} />
        <div className="flex-1 p-8 overflow-auto">
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

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search providers by name, email, phone or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 pl-12
              placeholder-[#92adc9] focus:outline-none focus:border-[#137fec]"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#92adc9]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

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
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#92adc9] text-lg mb-4">No providers match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map(provider => (
              <div
                key={provider.id}
                onClick={() => navigate(`${ROUTES.PROVIDERS}/${provider.id}/edit`)}
                className="bg-[#192633] rounded-lg border border-[#324d67] hover:border-[#137fec] transition-all cursor-pointer overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-[#0d1117] border-b border-[#324d67]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#137fec]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#137fec]" style={{ fontSize: '24px' }}>
                          domain
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {provider.name}
                        </h3>
                        {provider.email && (
                          <p className="text-xs text-[#92adc9]">{provider.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {provider.iban && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(provider.iban);
                            alert('IBAN copied to clipboard!');
                          }}
                          className="w-10 h-10 rounded-lg bg-[#192633] border border-[#324d67] text-[#92adc9] hover:text-white hover:border-[#137fec] transition-all flex items-center justify-center"
                          title="Copy IBAN"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '18px' }}>mail</span>
                      <span className="text-sm text-white truncate">{provider.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '18px' }}>phone</span>
                      <span className="text-sm text-white">{provider.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Address */}
                  {(provider.address || provider.city || provider.country) && (
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '18px' }}>location_on</span>
                      <span className="text-sm text-[#92adc9]">
                        {[provider.address, provider.city, provider.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Items */}
                  {provider.items && provider.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#324d67]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '16px' }}>inventory_2</span>
                        <span className="text-xs text-[#92adc9] font-semibold uppercase">Items ({provider.items.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {provider.items.slice(0, 4).map((item) => (
                          <span
                            key={item.id}
                            className="px-2 py-0.5 bg-[#137fec]/10 text-[#4a9eff] text-xs font-medium rounded"
                          >
                            {item.name}
                          </span>
                        ))}
                        {provider.items.length > 4 && (
                          <span className="px-2 py-0.5 bg-[#324d67] text-[#92adc9] text-xs font-medium rounded">
                            +{provider.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IBAN */}
                  {provider.iban && (
                    <div className="mt-4 pt-4 border-t border-[#324d67]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '16px' }}>account_balance</span>
                        <span className="text-xs text-[#92adc9] font-mono">{provider.iban}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#324d67]">
                    <div className="flex items-center gap-1 text-xs text-[#92adc9]">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                      <span>Provider since {formatDateToEuropean(provider.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#137fec]">
                      <span>Edit</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProvidersPage;
