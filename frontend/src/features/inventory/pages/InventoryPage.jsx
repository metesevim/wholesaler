/**
 * InventoryPage Component
 *
 * Page for viewing and managing inventory items
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import RestockModal from '../components/RestockModal';
import { inventoryRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import { formatDateToEuropean } from '../../../shared/utils/dateFormatter';
import logger from '../../../shared/utils/logger';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [restocking, setRestocking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inventoryRepository.getAllItems();
      if (result.success) {
        console.log('Inventory items loaded:', result.data);
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

  const handleRestockConfirm = async (restockData) => {
    setRestocking(true);
    try {
      const result = await inventoryRepository.updateItem(restockItem.id, {
        ...restockItem,
        quantity: restockData.newTotal
      });

      if (result.success) {
        // Update the items list with the new quantity
        setItems(prev =>
          prev.map(item =>
            item.id === restockItem.id
              ? { ...item, quantity: restockData.newTotal }
              : item
          )
        );
        setRestockItem(null);
        logger.info(`Item restocked: ${restockItem.name} + ${restockData.addedQuantity} ${restockData.unit}`);
      } else {
        setError(result.error || 'Failed to restock item');
      }
    } catch (err) {
      logger.error('Failed to restock item:', err);
      setError('Failed to restock item. Please try again.');
    } finally {
      setRestocking(false);
    }
  };

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function to determine color based on capacity percentage
  const getStockColor = (percentage) => {
    if (percentage >= 75) {
      return { bar: 'bg-green-500', text: 'text-green-400', badge: 'text-green-400' };
    } else if (percentage >= 50) {
      return { bar: 'bg-yellow-500', text: 'text-yellow-400', badge: 'text-yellow-400' };
    } else if (percentage >= 25) {
      return { bar: 'bg-orange-500', text: 'text-orange-400', badge: 'text-orange-400' };
    } else {
      return { bar: 'bg-red-500', text: 'text-red-400', badge: 'text-red-400' };
    }
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.INVENTORY} />
      <div className="flex-1 p-8 overflow-auto">
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

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search items by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
              placeholder-[#92adc9] focus:outline-none focus:border-[#137fec]"
          />
        </div>

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
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#92adc9] text-lg mb-4">No items match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
              const capacityPercentage = Math.min((item.quantity / item.maximumCapacity) * 100, 100);
              const stockColor = getStockColor(capacityPercentage);

              return (
                <div
                  key={item.id}
                  className="bg-[#192633] rounded-lg border border-[#324d67] hover:border-[#137fec] transition-all duration-300 overflow-hidden"
                >
                  {/* Header Section */}
                  <div className="p-4 border-b border-[#324d67] bg-[#0d1117]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#137fec] font-semibold uppercase tracking-wide">
                          {item.category?.name || 'Uncategorized'}
                        </p>
                      </div>
                      {capacityPercentage <= 50 && (
                        <div className={`${stockColor.text.includes('red') ? 'bg-red-600/20 border border-red-500' : stockColor.text.includes('orange') ? 'bg-orange-600/20 border border-orange-500' : 'bg-yellow-600/20 border border-yellow-500'} rounded px-2 py-1 ml-2`}>
                          <p className={`text-xs font-semibold ${stockColor.badge}`}>
                            {capacityPercentage <= 25 ? 'CRITICAL' : 'LOW STOCK'}
                          </p>
                        </div>
                      )}
                      {isExpired && (
                        <div className="bg-red-600/20 border border-red-500 rounded px-2 py-1 ml-2">
                          <p className="text-xs text-red-400 font-semibold">EXPIRED</p>
                        </div>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-[#92adc9] line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="p-4 space-y-4">
                    {/* Stock Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#92adc9]">Stock Level</span>
                        <span className={`text-sm font-bold ${stockColor.text}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${stockColor.bar}`}
                          style={{ width: `${capacityPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#92adc9]">
                        <span>Min: {item.minimumCapacity} {item.unit}</span>
                        <span>Max: {item.maximumCapacity} {item.unit}</span>
                      </div>
                    </div>

                    {/* Price & Provider */}
                    <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#324d67]">
                      <div>
                        <p className="text-xs text-[#92adc9] font-semibold uppercase mb-1">Price</p>
                        <p className="text-lg font-bold text-white">₺{item.pricePerUnit?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#92adc9] font-semibold uppercase mb-1">Provider</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {item.provider?.name || '—'}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-[#92adc9] font-semibold uppercase mb-1">Produced</p>
                        <p className="text-sm text-white">
                          {item.productionDate ? formatDateToEuropean(item.productionDate) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#92adc9] font-semibold uppercase mb-1">Expires</p>
                        <p className={`text-sm font-semibold ${isExpired ? 'text-red-400' : 'text-white'}`}>
                          {item.expiryDate ? formatDateToEuropean(item.expiryDate) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-[#324d67] bg-[#0d1117] flex gap-2">
                    <Button
                      onClick={() => setRestockItem(item)}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      Restock
                    </Button>
                    <Button
                      onClick={() => navigate(`/inventory/${item.id}/edit`)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <RestockModal
          item={restockItem}
          onConfirm={handleRestockConfirm}
          onCancel={() => setRestockItem(null)}
          loading={restocking}
        />
      )}
    </div>
  );
};

export default InventoryPage;
