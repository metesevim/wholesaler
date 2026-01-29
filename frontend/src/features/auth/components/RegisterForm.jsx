/**
 * RegisterForm Component
 *
 * Form for user registration
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../../components/forms/Input';
import Button from '../../../components/forms/Button';

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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-[#92adc9]">Register for a new account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          disabled={loading}
          required
        />

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-[#92adc9] mb-2">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-3 bg-[#192633] border border-[#324d67] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4a9eff] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>
          <p className="mt-1 text-xs text-[#92adc9]">
            Select Admin for full access or Employee for limited access
          </p>
        </div>

        {/* Password */}
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          disabled={loading}
          required
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          disabled={loading}
          required
        />

        {/* Error Message */}
        {displayError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{displayError}</p>
          </div>
        )}

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
        <div className="text-center">
          <button
            type="button"
            onClick={onToggleMode}
            disabled={loading}
            className="text-[#4a9eff] hover:text-[#6bb0ff] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Already have an account? Login
          </button>
        </div>
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

