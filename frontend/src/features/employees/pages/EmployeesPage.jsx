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
import TopBar from '../../../components/layout/TopBar';
import useAuth from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../shared/constants/appConstants';
import { formatDateToEuropean } from '../../../shared/utils/dateFormatter';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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


  // Filter employees based on search term and sort alphabetically
  const filteredEmployees = employees
    .filter(employee =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.phone && employee.phone.includes(searchTerm))
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.EMPLOYEES} />
      <div className="flex-1 flex flex-col">
        <TopBar user={user} />
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

          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search employees by name, username, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4 pl-12
                placeholder-[#92adc9] focus:outline-none focus:border-[#137fec]"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#92adc9]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

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
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#92adc9] text-lg mb-4">No employees match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEmployees.map(employee => (
              <div
                key={employee.id}
                onClick={() => navigate(`${ROUTES.EMPLOYEES}/${employee.id}/edit`)}
                className="bg-[#192633] rounded-lg border border-[#324d67] hover:border-[#137fec] transition-all cursor-pointer overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-[#0d1117] border-b border-[#324d67]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#137fec]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#137fec]" style={{ fontSize: '24px' }}>
                          person
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {employee.fullName}
                        </h3>
                        <p className="text-xs text-[#92adc9]">@{employee.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {employee.iban && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(employee.iban);
                            alert('IBAN copied to clipboard!');
                          }}
                          className="w-10 h-10 rounded-lg bg-[#192633] border border-[#324d67] text-[#92adc9] hover:text-white hover:border-[#137fec] transition-all flex items-center justify-center"
                          title="Copy IBAN"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '18px' }}>mail</span>
                      <span className="text-sm text-white truncate">{employee.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '18px' }}>phone</span>
                      <span className="text-sm text-white">{employee.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Permissions */}
                  {employee.permissions && employee.permissions.length > 0 && (
                    <div className="pt-4 border-t border-[#324d67]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#92adc9]" style={{ fontSize: '16px' }}>security</span>
                        <span className="text-xs text-[#92adc9] font-semibold uppercase">Permissions</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {employee.permissions.slice(0, 4).map((permission, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#137fec]/10 text-[#4a9eff] text-xs font-medium rounded"
                          >
                            {permission.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {employee.permissions.length > 4 && (
                          <span className="px-2 py-0.5 bg-[#324d67] text-[#92adc9] text-xs font-medium rounded">
                            +{employee.permissions.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#324d67]">
                    <div className="flex items-center gap-1 text-xs text-[#92adc9]">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                      <span>Added {formatDateToEuropean(employee.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#137fec]">
                      <span>Edit</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
