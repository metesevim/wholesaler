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

        {/* Default Route - Redirect to login */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* 404 - Redirect to login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

