/**
 * AppRouter Component
 *
 * Main routing configuration for the application
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import HomepagePage from '../features/dashboard/pages/HomepagePage';
import OrdersPage from '../features/orders/pages/OrdersPage';
import AddOrderPage from '../features/orders/pages/AddOrderPage';
import EditOrderPage from '../features/orders/pages/EditOrderPage';
import InventoryPage from '../features/inventory/pages/InventoryPage';
import AddInventoryPage from '../features/inventory/pages/AddInventoryPage';
import EditInventoryPage from '../features/inventory/pages/EditInventoryPage';
import CustomersPage from '../features/customers/pages/CustomersPage';
import AddCustomerPage from '../features/customers/pages/AddCustomerPage';
import EditCustomerPage from '../features/customers/pages/EditCustomerPage';
import ProvidersPage from '../features/providers/pages/ProvidersPage';
import AddProviderPage from '../features/providers/pages/AddProviderPage';
import EditProviderPage from '../features/providers/pages/EditProviderPage';
import EmployeesPage from '../features/employees/pages/EmployeesPage';
import AddEmployeePage from '../features/employees/pages/AddEmployeePage';
import EditEmployeePage from '../features/employees/pages/EditEmployeePage';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage';
import LogsPage from '../features/logs/pages/LogsPage';
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
          path={ROUTES.HOMEPAGE}
          element={
            <ProtectedRoute>
              <HomepagePage />
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

        {/* Provider Routes */}
        <Route
          path={ROUTES.PROVIDERS}
          element={
            <ProtectedRoute>
              <ProvidersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADD_PROVIDER}
          element={
            <ProtectedRoute>
              <AddProviderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/providers/:id/edit"
          element={
            <ProtectedRoute>
              <EditProviderPage />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path={ROUTES.EMPLOYEES}
          element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADD_EMPLOYEE}
          element={
            <ProtectedRoute>
              <AddEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EDIT_EMPLOYEE}
          element={
            <ProtectedRoute>
              <EditEmployeePage />
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

        {/* Logs Route */}
        <Route
          path={ROUTES.LOGS}
          element={
            <ProtectedRoute>
              <LogsPage />
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

