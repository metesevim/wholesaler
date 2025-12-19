/**
 * LoginForm Component
 *
 * Login form with validation and error handling
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../../components/forms/Input';
import PasswordInput from '../../../components/forms/PasswordInput';
import Button from '../../../components/forms/Button';
import FormField from '../../../components/forms/FormField';
import Message from '../../../components/feedback/Message';
import { validateLoginCredentials } from '../../../domain/validators/authValidators';

const LoginForm = ({
  onSubmit,
  loading = false,
  error = null,
  onToggleMode
}) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const handleChange = (field) => (e) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate credentials
    const validation = validateLoginCredentials(credentials);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    // Call parent submit handler
    onSubmit(credentials);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col gap-3">
        <p className="text-3xl font-black text-white">Welcome Back!</p>
        <p className="text-base text-[#92adc9]">
          Log in to your Wholesaler Assistant account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Global Error Message */}
        {error && (
          <Message type="error">{error}</Message>
        )}

        {/* Username Field */}
        <FormField label="Username or Email" required>
          <Input
            type="text"
            value={credentials.username}
            onChange={handleChange('username')}
            onKeyPress={handleKeyPress}
            placeholder="Enter your username or email"
            icon={UserIcon}
            error={validationErrors.username}
            disabled={loading}
          />
        </FormField>

        {/* Password Field */}
        <FormField label="Password" required>
          <PasswordInput
            value={credentials.password}
            onChange={handleChange('password')}
            onKeyPress={handleKeyPress}
            placeholder="Enter your password"
            error={validationErrors.password}
            disabled={loading}
          />
        </FormField>

        {/* Forgot Password */}
        <p className="text-sm font-medium text-[#137fec] underline hover:text-[#1a8fff] cursor-pointer self-start">
          Forgot Password?
        </p>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>

        {/* Toggle to Register */}
        {onToggleMode && (
          <p className="text-sm text-center text-[#92adc9]">
            Don't have an account?{' '}
            <span
              onClick={onToggleMode}
              className="font-medium text-[#137fec] underline hover:text-[#1a8fff] cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onToggleMode: PropTypes.func
};

export default LoginForm;

