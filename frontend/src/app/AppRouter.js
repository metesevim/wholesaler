/**
 * AppRouter Component
 *
 * Main routing configuration for the application
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import OrdersPage from '../features/orders/pages/OrdersPage';
import AddOrderPage from '../features/orders/pages/AddOrderPage';
import EditOrderPage from '../features/orders/pages/EditOrderPage';
import InventoryPage from '../features/inventory/pages/InventoryPage';
import AddInventoryPage from '../features/inventory/pages/AddInventoryPage';
import EditInventoryPage from '../features/inventory/pages/EditInventoryPage';
import CustomersPage from '../features/customers/pages/CustomersPage';
import AddCustomerPage from '../features/customers/pages/AddCustomerPage';
import EditCustomerPage from '../features/customers/pages/EditCustomerPage';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../shared/constants/appConstants';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Orders Routes */}
        <Route
          path={ROUTES.ORDERS}
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADD_ORDER}
          element={
            <ProtectedRoute>
              <AddOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id/edit"
          element={
            <ProtectedRoute>
              <EditOrderPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path={ROUTES.INVENTORY}
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADD_INVENTORY}
          element={
            <ProtectedRoute>
              <AddInventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/:id/edit"
          element={
            <ProtectedRoute>
              <EditInventoryPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path={ROUTES.CUSTOMERS}
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADD_CUSTOMER}
          element={
            <ProtectedRoute>
              <AddCustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id/edit"
          element={
            <ProtectedRoute>
              <EditCustomerPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <ProtectedRoute>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route - Redirect to login */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* 404 - Redirect to login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

