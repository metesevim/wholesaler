/**
 * LoginPage Component
 *
 * Login page - connects LoginForm with auth logic
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import useAuth from '../hooks/useAuth';
import { ROUTES } from '../../../shared/constants/appConstants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const handleSubmit = async (credentials) => {
    const result = await login(credentials);

    if (result.success) {
      // Redirect to dashboard on successful login
      navigate(ROUTES.DASHBOARD);
    }
  };

  const handleToggleMode = () => {
    navigate(ROUTES.REGISTER);
  };

  return (
    <AuthLayout>
      <LoginForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onToggleMode={handleToggleMode}
      />
    </AuthLayout>
  );
};

export default LoginPage;

