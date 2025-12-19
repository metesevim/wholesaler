/**
 * RegisterPage Component
 *
 * Registration page - connects RegisterForm with auth logic
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import authRepository from '../../../data/repositories/authRepository';
import storage from '../../../shared/utils/storage';
import { ROUTES } from '../../../shared/constants/appConstants';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authRepository.register(userData);

      if (result.success) {
        // Registration successful
        // Option 1: Auto-login after registration
        // For now, we'll just redirect to login page
        alert('Registration successful! Please login with your credentials.');
        navigate(ROUTES.LOGIN);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <AuthLayout>
      <RegisterForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onToggleMode={handleToggleMode}
      />
    </AuthLayout>
  );
};

export default RegisterPage;

