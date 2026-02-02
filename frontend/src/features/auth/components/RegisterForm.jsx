/**
 * RegisterForm Component
 *
 * Form for user registration
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../../components/forms/Input';
import PasswordInput from '../../../components/forms/PasswordInput';
import Button from '../../../components/forms/Button';
import FormField from '../../../components/forms/FormField';
import Message from '../../../components/feedback/Message';

const RegisterForm = ({ onSubmit, loading, error, onToggleMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Employee' // Default to Employee
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError(''); // Clear validation error on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setValidationError('All fields are required');
      return;
    }

    if (formData.username.length < 3) {
      setValidationError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Submit
    onSubmit({
      username: formData.username,
      password: formData.password,
      role: formData.role
    });
  };

  const displayError = validationError || error;

  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col gap-3">
        <p className="text-3xl font-black text-white">Create Account</p>
        <p className="text-base text-[#92adc9]">
          Register for a new account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Global Error Message */}
        {displayError && (
          <Message type="error">{displayError}</Message>
        )}

        {/* Username Field */}
        <FormField label="Username" required>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            disabled={loading}
          />
        </FormField>

        {/* Password Field */}
        <FormField label="Password" required>
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={loading}
          />
        </FormField>

        {/* Confirm Password Field */}
        <FormField label="Confirm Password" required>
          <PasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            disabled={loading}
          />
        </FormField>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        {/* Toggle to Login */}
        {onToggleMode && (
          <p className="text-sm text-center text-[#92adc9]">
            Already have an account?{' '}
            <span
              onClick={onToggleMode}
              className="font-medium text-[#137fec] underline hover:text-[#1a8fff] cursor-pointer"
            >
              Login
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onToggleMode: PropTypes.func.isRequired
};

RegisterForm.defaultProps = {
  loading: false,
  error: null
};

export default RegisterForm;

