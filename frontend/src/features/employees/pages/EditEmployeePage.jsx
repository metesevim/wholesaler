/**
 * EditEmployeePage Component
 *
 * Page for editing employee and managing their permissions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import FormField from '../../../components/forms/FormField';
import Input from '../../../components/forms/Input';
import Switch from '../../../components/forms/Switch';
import { ROUTES } from '../../../shared/constants/appConstants';

const EditEmployeePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    address: '',
    iban: '',
    createdAt: ''
  });
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available permissions
  const availablePermissions = [
    { key: 'VIEW_ORDERS', label: 'View Orders', icon: 'visibility' },
    { key: 'CREATE_ORDERS', label: 'Create Orders', icon: 'add_circle' },
    { key: 'EDIT_ORDERS', label: 'Edit Orders', icon: 'edit' },
    { key: 'DELETE_ORDERS', label: 'Delete Orders', icon: 'delete' },
    { key: 'VIEW_INVENTORY', label: 'View Inventory', icon: 'visibility' },
    { key: 'CREATE_INVENTORY', label: 'Create Inventory', icon: 'add_circle' },
    { key: 'EDIT_INVENTORY', label: 'Edit Inventory', icon: 'edit' },
    { key: 'DELETE_INVENTORY', label: 'Delete Inventory', icon: 'delete' },
    { key: 'VIEW_CUSTOMERS', label: 'View Customers', icon: 'visibility' },
    { key: 'CREATE_CUSTOMERS', label: 'Create Customers', icon: 'add_circle' },
    { key: 'EDIT_CUSTOMERS', label: 'Edit Customers', icon: 'edit' },
    { key: 'DELETE_CUSTOMERS', label: 'Delete Customers', icon: 'delete' },
    { key: 'VIEW_PROVIDERS', label: 'View Providers', icon: 'visibility' },
    { key: 'CREATE_PROVIDERS', label: 'Create Providers', icon: 'add_circle' },
    { key: 'EDIT_PROVIDERS', label: 'Edit Providers', icon: 'edit' },
    { key: 'DELETE_PROVIDERS', label: 'Delete Providers', icon: 'delete' }
  ];

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to load from localStorage first
      const savedEmployees = localStorage.getItem('employees');

      let mockEmployeesData;
      if (savedEmployees) {
        // Convert saved employees array to object by ID
        const employeesArray = JSON.parse(savedEmployees);
        mockEmployeesData = {};
        employeesArray.forEach(emp => {
          mockEmployeesData[emp.id] = emp;
        });
      } else {
        // Fallback to initial mock data
        mockEmployeesData = {
          1: {
            id: 1,
            username: 'john_doe',
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            nationalId: '123456789',
            address: '123 Main Street, City, Country',
            iban: 'DE89370400440532013000',
            createdAt: new Date('2025-01-15').toISOString(),
            permissions: ['VIEW_ORDERS', 'VIEW_INVENTORY', 'CREATE_ORDERS']
          },
          2: {
            id: 2,
            username: 'jane_smith',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+0987654321',
            nationalId: '987654321',
            address: '456 Oak Avenue, Town, Country',
            iban: 'GB82WEST12345698765432',
            createdAt: new Date('2025-01-20').toISOString(),
            permissions: ['VIEW_ORDERS', 'VIEW_INVENTORY', 'CREATE_ORDERS', 'EDIT_ORDERS']
          }
        };
      }

      // Get the correct employee based on ID, fallback to first one if not found
      const mockEmployee = mockEmployeesData[parseInt(id)] || mockEmployeesData[1];

      setFormData({
        username: mockEmployee.username,
        fullName: mockEmployee.fullName,
        email: mockEmployee.email,
        phone: mockEmployee.phone,
        nationalId: mockEmployee.nationalId,
        address: mockEmployee.address,
        iban: mockEmployee.iban,
        createdAt: mockEmployee.createdAt
      });

      // Initialize permissions state
      const permissionsState = {};
      availablePermissions.forEach(perm => {
        permissionsState[perm.key] = mockEmployee.permissions.includes(perm.key);
      });
      setPermissions(permissionsState);
    } catch (err) {
      setError('Failed to load employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePermissionChange = (permissionKey) => {
    setPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    if (!formData.fullName) {
      setError('Full name is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const selectedPermissions = Object.keys(permissions).filter(
      key => permissions[key]
    );

    setLoading(true);
    try {
      // Get all employees from localStorage
      const savedEmployees = localStorage.getItem('employees');
      const employeesArray = savedEmployees ? JSON.parse(savedEmployees) : [];

      // Find and update the employee
      const employeeIndex = employeesArray.findIndex(emp => emp.id === parseInt(id));

      if (employeeIndex !== -1) {
        // Update the employee with new data
        employeesArray[employeeIndex] = {
          ...employeesArray[employeeIndex],
          ...formData,
          permissions: selectedPermissions
        };

        // Save back to localStorage
        localStorage.setItem('employees', JSON.stringify(employeesArray));
      }

      alert('Employee information updated successfully!');
      navigate(ROUTES.EMPLOYEES);
    } catch (err) {
      setError('Failed to update employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.EMPLOYEES);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#101922] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <svg className="w-12 h-12 text-[#137fec] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-white">Loading employee...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.EMPLOYEES} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title={`Edit Employee - ${formData.username}`}
            subtitle="Manage employee information and permissions"
            backButton
            onBack={handleCancel}
            rightContent={
              <Button
                onClick={handleSubmit}
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-6">
            {/* Form Section */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Employee Information Section */}
                <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>
                    Employee Information
                  </h3>

                  {/* Username and Full Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <FormField label="Username">
                      <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Username"
                        disabled
                      />
                    </FormField>

                    <FormField label="Full Name" required>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        disabled={loading}
                      />
                    </FormField>
                  </div>

                  {/* Email Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                  {/* Phone and National ID Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <div className="mb-6">
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
                  </div>

                  {/* IBAN */}
                  <div className="mb-6">
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
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="bg-[#192633] rounded-lg p-6 border border-[#324d67]">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">security</span>
                    Permissions
                  </h3>

                  <div className="space-y-4">
                    {/* Orders Permissions */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-[#92adc9] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">assignment</span>
                        Orders
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions
                          .filter(p => p.key.includes('ORDERS'))
                          .map(permission => (
                            <Switch
                              key={permission.key}
                              label={permission.label}
                              checked={permissions[permission.key] || false}
                              onChange={() => handlePermissionChange(permission.key)}
                              disabled={loading}
                            />
                          ))}
                      </div>
                    </div>

                    {/* Inventory Permissions */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-[#92adc9] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">warehouse</span>
                        Inventory
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions
                          .filter(p => p.key.includes('INVENTORY'))
                          .map(permission => (
                            <Switch
                              key={permission.key}
                              label={permission.label}
                              checked={permissions[permission.key] || false}
                              onChange={() => handlePermissionChange(permission.key)}
                              disabled={loading}
                            />
                          ))}
                      </div>
                    </div>

                    {/* Customers Permissions */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#92adc9] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">people</span>
                        Customers
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions
                          .filter(p => p.key.includes('CUSTOMERS'))
                          .map(permission => (
                            <Switch
                              key={permission.key}
                              label={permission.label}
                              checked={permissions[permission.key] || false}
                              onChange={() => handlePermissionChange(permission.key)}
                              disabled={loading}
                            />
                          ))}
                      </div>
                    </div>

                    {/* Providers Permissions */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#92adc9] mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">domain</span>
                        Providers
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions
                          .filter(p => p.key.includes('PROVIDERS'))
                          .map(permission => (
                            <Switch
                              key={permission.key}
                              label={permission.label}
                              checked={permissions[permission.key] || false}
                              onChange={() => handlePermissionChange(permission.key)}
                              disabled={loading}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeePage;
