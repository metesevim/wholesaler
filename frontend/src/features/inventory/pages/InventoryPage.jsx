/**
 * InventoryPage Component
 *
 * Page for viewing and managing inventory items
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import { inventoryRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inventoryRepository.getAllItems();
      if (result.success) {
        setItems(result.data || []);
      } else {
        setError(result.error || 'Failed to load inventory items');
      }
    } catch (err) {
      logger.error('Failed to load inventory items:', err);
      setError('Failed to load inventory items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Inventory"
          subtitle="Manage your inventory items"
          rightContent={
            <Button

              onClick={() => navigate(ROUTES.ADD_INVENTORY)}
              variant="primary"
              size="md"
            >
              + Add Item
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
            <Button onClick={loadItems} variant="secondary" className="mt-3">
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
            <p className="ml-4 text-white">Loading inventory...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#92adc9] text-lg mb-4">No inventory items found</p>
            <Button
              onClick={() => navigate(ROUTES.ADD_INVENTORY)}
              variant="primary"
            >
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-bold text-white">
                    {item.name}
                  </h3>
                  <Button
                    onClick={() => navigate(`/inventory/${item.id}/edit`)}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
                {item.description && (
                  <p className="text-sm text-[#92adc9] mb-2">
                    {item.description}
                  </p>
                )}
                <div className="space-y-2 text-sm">
                  <p className="text-[#92adc9]">
                    <span className="font-semibold">Quantity:</span> {item.quantity} {item.unit}
                  </p>
                  <p className="text-[#92adc9]">
                    <span className="font-semibold">Price:</span> ${item.pricePerUnit?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
