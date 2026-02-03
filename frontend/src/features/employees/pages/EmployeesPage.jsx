/**
 * EmployeesPage Component
 *
 * Page for viewing and managing employees
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import { ROUTES } from '../../../shared/constants/appConstants';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to load from localStorage first
      const savedEmployees = localStorage.getItem('employees');

      if (savedEmployees) {
        // If employees exist in localStorage, use them
        setEmployees(JSON.parse(savedEmployees));
      } else {
        // Otherwise, use mock data and save to localStorage
        const mockEmployees = [
          {
            id: 1,
            username: 'john_doe',
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            nationalId: '123456789',
            address: '123 Main Street, City, Country',
            iban: 'DE89370400440532013000',
            role: 'Employee',
            createdAt: new Date('2025-01-15').toISOString(),
            permissions: ['VIEW_ORDERS', 'VIEW_INVENTORY']
          },
          {
            id: 2,
            username: 'jane_smith',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+0987654321',
            nationalId: '987654321',
            address: '456 Oak Avenue, Town, Country',
            iban: 'GB82WEST12345698765432',
            role: 'Employee',
            createdAt: new Date('2025-01-20').toISOString(),
            permissions: ['VIEW_ORDERS', 'VIEW_INVENTORY', 'CREATE_ORDERS']
          }
        ];
        setEmployees(mockEmployees);
        localStorage.setItem('employees', JSON.stringify(mockEmployees));
      }
    } catch (err) {
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.EMPLOYEES} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Employees"
            subtitle="Manage your team members and their permissions"
            rightContent={
              <Button
                onClick={() => navigate(ROUTES.ADD_EMPLOYEE)}
                variant="primary"
              >
                + Add Employee
              </Button>
            }
          />

          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
              <Button onClick={loadEmployees} variant="secondary" className="mt-3">
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <svg className="w-12 h-12 text-[#137fec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="ml-4 text-white">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#92adc9] text-lg mb-4">No employees found</p>
              <Button
                onClick={() => navigate(ROUTES.ADD_EMPLOYEE)}
                variant="primary"
              >
                Create Your First Employee
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {employees.map(employee => (
              <div
                key={employee.id}
                className="bg-[#192633] rounded-lg p-6 border border-[#324d67] hover:border-[#137fec] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {employee.fullName}
                    </h3>
                    <p className="text-xs text-[#92adc9]">@{employee.username}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {employee.iban && (
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(employee.iban);
                          alert('IBAN copied to clipboard!');
                        }}
                        variant="primary"
                        size="sm"
                      >
                        Copy IBAN
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate(`${ROUTES.EMPLOYEES}/${employee.id}/edit`)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="border-t border-[#324d67] my-2"></div>
                  <p className="text-[#92adc9] mb-2">
                    <span className="font-semibold">Email:</span> {employee.email || 'N/A'}
                  </p>
                  <p className="text-[#92adc9] mb-2">
                    <span className="font-semibold">Phone:</span> {employee.phone || 'No phone'}
                  </p>
                  <div className="border-t border-[#324d67] my-2"></div>
                  {employee.nationalId && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">National ID:</span> {employee.nationalId}
                    </p>
                  )}
                  {employee.address && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">Address:</span> {employee.address}
                    </p>
                  )}
                  <div className="border-t border-[#324d67] my-2"></div>
                  {employee.iban && (
                    <p className="text-[#92adc9] mb-2">
                      <span className="font-semibold">IBAN:</span> {employee.iban}
                    </p>
                  )}
                  <p className="text-[#92adc9] mb-2">
                    <span className="font-semibold">Created:</span> {new Date(employee.createdAt).toLocaleDateString()}
                  </p>
                </div>

                  {employee.permissions && employee.permissions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#324d67]">
                      <p className="text-sm text-[#92adc9] font-semibold mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.permissions.map((permission, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#137fec]/20 text-[#4a9eff] text-xs font-medium rounded-full"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
