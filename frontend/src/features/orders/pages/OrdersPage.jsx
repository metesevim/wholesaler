/**
 * OrdersPage Component
 *
 * Page for viewing and managing orders
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import { orderRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import { formatDateToEuropean } from '../../../shared/utils/dateFormatter';
import logger from '../../../shared/utils/logger';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderRepository.getAllOrders();
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      logger.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group orders by status
  const getOrdersByStatus = () => {
    const grouped = {
      PENDING: [],
      SHIPPED: [],
      DELIVERED: [],
      CANCELLED: []
    };

    const filteredOrders = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const customerName = order.customer?.name?.toLowerCase() || '';
      const orderId = order.id?.toString() || '';
      return customerName.includes(searchLower) || orderId.includes(searchLower);
    });

    filteredOrders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      SHIPPED: 'bg-blue-500/20 text-blue-400',
      DELIVERED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  // Sort items by category priority
  const getSortedItems = (items) => {
    if (!items) return [];

    return [...items].sort((a, b) => {
      const categoryA = a.adminItem?.category;
      const categoryB = b.adminItem?.category;

      if (!categoryA && !categoryB) return 0;
      if (!categoryA) return 1;
      if (!categoryB) return -1;

      return (categoryA.priority || 0) - (categoryB.priority || 0);
    });
  };

  // Generate and print warehouse picking list
  const handlePrintPickingList = (order) => {
    if (!order?.items || order.items.length === 0) {
      alert('No items in this order to print');
      return;
    }

    const sortedItems = getSortedItems(order.items);
    const printWindow = window.open('', '_blank');

    // Group items by category
    const itemsByCategory = {};
    sortedItems.forEach(item => {
      const categoryName = item.adminItem?.category?.name || 'UNCATEGORIZED';
      if (!itemsByCategory[categoryName]) {
        itemsByCategory[categoryName] = [];
      }
      itemsByCategory[categoryName].push(item);
    });

    // Build HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Picking List - Order #${order.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #fff;
            color: #333;
            padding: 40px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 14px;
            color: #666;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            font-size: 13px;
          }
          .order-info div {
            display: flex;
            gap: 20px;
          }
          .category-section {
            margin-bottom: 30px;
            break-inside: avoid;
          }
          .category-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #137fec;
          }
          .category-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #137fec;
            color: white;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
          }
          .category-name {
            font-size: 18px;
            font-weight: bold;
          }
          .item {
            margin-bottom: 12px;
            padding: 12px;
            background: #f5f5f5;
            border-left: 3px solid #137fec;
            border-radius: 4px;
          }
          .item-name {
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 5px;
          }
          .item-detail {
            font-size: 13px;
            color: #666;
            margin: 3px 0;
          }
          .item-quantity {
            font-size: 14px;
            font-weight: 600;
            color: #137fec;
            margin-top: 5px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
          @media print {
            body { padding: 20px; }
            .category-section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Warehouse Picking List</h1>
          <p>Order #${order.id}</p>
        </div>

        <div class="order-info">
          <div>
            <div><strong>Customer:</strong> ${order.customer?.name || 'Unknown'}</div>
            <div><strong>Date:</strong> ${formatDateToEuropean(order.createdAt)}</div>
          </div>
          <div>
            <div><strong>Total Items:</strong> ${sortedItems.length}</div>
            <div><strong>Total Amount:</strong> ₺${order.totalAmount?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
    `;

    // Get all categories sorted by priority
    const categories = Object.keys(itemsByCategory).sort((a, b) => {
      const priorityA = itemsByCategory[a][0]?.adminItem?.category?.priority || 999;
      const priorityB = itemsByCategory[b][0]?.adminItem?.category?.priority || 999;
      return priorityA - priorityB;
    });

    // Add categories and items
    categories.forEach((categoryName, idx) => {
      const items = itemsByCategory[categoryName];
      const categoryPriority = items[0]?.adminItem?.category?.priority ?? (idx + 1);

      htmlContent += `
        <div class="category-section">
          <div class="category-header">
            <div class="category-number">${categoryPriority + 1}</div>
            <div class="category-name">${categoryName}</div>
          </div>
      `;

      items.forEach(item => {
        htmlContent += `
          <div class="item">
            <div class="item-name">${item.itemName || `Item ${item.adminItemId}`}</div>
            <div class="item-detail">ID: ${item.adminItemId}</div>
            <div class="item-quantity">📦 Qty: ${item.quantity} ${item.unit}</div>
            <div class="item-detail">Price: ₺${item.pricePerUnit?.toFixed(2) || '0.00'} per unit</div>
            <div class="item-detail">Total: ₺${item.totalPrice?.toFixed(2) || '0.00'}</div>
          </div>
        `;
      });

      htmlContent += `</div>`;
    });

    htmlContent += `
        <div class="footer">
          <p>Printed on: ${new Date().toLocaleString()}</p>
          <p>Please verify all items before sealing the shipment</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const StatusSection = ({ status, statusOrders }) => {
    if (statusOrders.length === 0) return null;

    const statusColor = getStatusColor(status);

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">{status}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {statusOrders.length}
          </span>
        </div>
        <div className="space-y-3">
          {statusOrders.map(order => (
            <div
              key={order.id}
              onClick={() => navigate(`${ROUTES.ORDERS}/${order.id}/edit`)}
              className="bg-[#192633] rounded-lg p-5 border border-[#324d67] hover:border-[#137fec] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left Section - Customer and Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-white truncate">
                      {order.customer?.name || 'Unknown Customer'}
                    </h3>
                    <span className="text-xs text-[#92adc9] whitespace-nowrap">
                      #{order.id}
                    </span>
                  </div>
                  <p className="text-sm text-[#92adc9]">
                    {formatDateToEuropean(order.createdAt)}
                  </p>
                </div>

                {/* Middle Left Section - Total Items */}
                <div className="text-right">
                  <p className="text-sm text-[#92adc9] mb-1">Items</p>
                  <p className="text-lg font-bold text-white">
                    {order.items?.length || 0}
                  </p>
                </div>

                {/* Middle Section - Payment Deadline */}
                <div className="text-right">
                  <p className="text-sm text-[#92adc9] mb-1">Payment Deadline</p>
                  <p className="text-lg font-bold text-white">
                    {order.lastPaymentDate
                      ? formatDateToEuropean(order.lastPaymentDate)
                      : '-'
                    }
                  </p>
                </div>

                {/* Middle Right Section - Total Amount */}
                <div className="text-right">
                  <p className="text-sm text-[#92adc9] mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-white">
                    ₺{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                  </p>
                </div>

                {/* Right Section - Status */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintPickingList(order);
                    }}
                    className="h-10 px-6 rounded-lg bg-[#137fec] text-white hover:bg-[#0f5fb8]
                      hover:shadow-lg hover:shadow-blue-500/20 active:scale-98
                      transition-all duration-200 flex items-center justify-center font-medium text-sm"
                    title="Print Picking List"
                  >
                    Print
                  </button>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.ORDERS} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Orders"
          subtitle="Manage your orders"
          rightContent={
            <Button
              onClick={() => navigate(ROUTES.ADD_ORDER)}
              variant="primary"
            >
              + Create Order
            </Button>
          }
        />

        {/* Search Bar */}
        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="Search by customer name or order ID..."
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

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
            <Button onClick={loadOrders} variant="secondary" className="mt-3">
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
            <p className="ml-4 text-white">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#92adc9] text-lg mb-4">No orders found</p>
            <Button
              onClick={() => navigate(ROUTES.ADD_ORDER)}
              variant="primary"
            >
              Create Your First Order
            </Button>
          </div>
        ) : (
          <div>
            <StatusSection
              status="PENDING"
              statusOrders={getOrdersByStatus().PENDING}
            />
            <StatusSection
              status="SHIPPED"
              statusOrders={getOrdersByStatus().SHIPPED}
            />
            <StatusSection
              status="DELIVERED"
              statusOrders={getOrdersByStatus().DELIVERED}
            />
            <StatusSection
              status="CANCELLED"
              statusOrders={getOrdersByStatus().CANCELLED}
            />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
