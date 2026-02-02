/**
 * AddEmployeePage Component
 *
 * Page for creating a new employee
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import FormField from '../../../components/forms/FormField';
import Input from '../../../components/forms/Input';
import PasswordInput from '../../../components/forms/PasswordInput';
import { ROUTES } from '../../../shared/constants/appConstants';

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    nationalId: '',
    address: '',
    iban: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username || !formData.password || !formData.confirmPassword || !formData.email) {
      setError('Username, password, and email are required');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Get existing employees from localStorage
      const savedEmployees = localStorage.getItem('employees');
      const employeesArray = savedEmployees ? JSON.parse(savedEmployees) : [];

      // Generate new ID (max ID + 1)
      const newId = employeesArray.length > 0 ? Math.max(...employeesArray.map(e => e.id)) + 1 : 1;

      // Create new employee object
      const newEmployee = {
        id: newId,
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        nationalId: formData.nationalId,
        address: formData.address,
        iban: formData.iban,
        role: 'Employee',
        createdAt: new Date().toISOString(),
        permissions: []
      };

      // Add new employee to array
      employeesArray.push(newEmployee);

      // Save to localStorage
      localStorage.setItem('employees', JSON.stringify(employeesArray));

      alert('Employee created successfully!');
      navigate(ROUTES.EMPLOYEES);
    } catch (err) {
      setError('Failed to create employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.EMPLOYEES);
  };

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.EMPLOYEES} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Add Employee"
            subtitle="Create a new employee account"
            backButton
            onBack={handleCancel}
          />

          <div className="bg-[#192633] rounded-lg p-8 border border-[#324d67]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Username and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Username" required>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter employee username"
                    disabled={loading}
                  />
                </FormField>

                <FormField label="Email" required>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                </FormField>
              </div>

              {/* Email Field */}
              <FormField label="Email" required>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  disabled={loading}
                />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Password" required>
                  <PasswordInput
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    disabled={loading}
                  />
                </FormField>

                <FormField label="Confirm Password" required>
                  <PasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    disabled={loading}
                  />
                </FormField>
              </div>

              {/* Phone and National ID Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Phone Number">
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </FormField>

                <FormField label="National ID Number">
                  <Input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    placeholder="Enter national ID number"
                    disabled={loading}
                  />
                </FormField>
              </div>

              {/* Address */}
              <FormField label="Address">
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  disabled={loading}
                />
              </FormField>

              {/* IBAN */}
              <FormField label="IBAN">
                <Input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="Enter IBAN"
                  disabled={loading}
                />
              </FormField>

              <div className="flex gap-3 pt-4 border-t border-[#324d67]">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Employee'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeePage;
