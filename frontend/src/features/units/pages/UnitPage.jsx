import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import Button from '../../../components/forms/Button';
import Input from '../../../components/forms/Input';
import FormField from '../../../components/forms/FormField';
import logger from '../../../shared/utils/logger';
import useAuth from "../../auth/hooks/useAuth";
import {ROUTES} from "../../../shared/constants/appConstants";
import TopBar from "../../../components/layout/TopBar";
import PageHeader from "../../../components/layout/PageHeader";

const UnitPage = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/units');
      if (!response.ok) throw new Error('Failed to load units');
      const data = await response.json();
      setUnits(data.units || []);
    } catch (err) {
      setError(err.message);
      logger.error('Failed to load units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUnit ? `/units/${editingUnit.id}` : '/units';
      const method = editingUnit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save unit');
      }

      await loadUnits();
      resetForm();
    } catch (err) {
      setError(err.message);
      logger.error('Failed to save unit:', err);
    }
  };

  const handleDelete = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;

    try {
      const response = await fetch(`/units/${unitId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete unit');

      await loadUnits();
    } catch (err) {
      setError(err.message);
      logger.error('Failed to delete unit:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingUnit(null);
    setShowCreateForm(false);
  };

  const startEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name, description: unit.description || '' });
    setShowCreateForm(true);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.UNITS} />
      <div className="flex-1 flex flex-col">
        <TopBar user={user} />
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <PageHeader
                  title="Units"
                  subtitle="Manage your units"
                  rightContent={
                    <Button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                      {showCreateForm ? 'Cancel' : '+ Add Unit'}
                    </Button>
                  }
              />

              {showCreateForm && (
                  <div className="bg-[#192633] rounded-lg shadow-sm border border-[#324d67] p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-white">
                      {editingUnit ? 'Edit Unit' : 'Create New Unit'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <FormField label="Unit Name">
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., kg, liter, piece"
                            required
                        />
                      </FormField>
                      <FormField label="Description (Optional)">
                        <Input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the unit"
                        />
                      </FormField>
                      <div className="flex gap-3">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          {editingUnit ? 'Update Unit' : 'Create Unit'}
                        </Button>
                        <Button type="button" onClick={resetForm} variant="secondary">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
              )}

              <div className="bg-[#192633] rounded-lg shadow-sm border border-[#324d67] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#324d67]">
                  <h2 className="text-lg font-semibold text-white">Available Units</h2>
                </div>
                <div className="divide-y divide-[#324d67]">
                  {units.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        No units found. Create your first unit above.
                      </div>
                  ) : (
                      units.map((unit) => (
                          <div key={unit.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-white">{unit.name}</h3>
                              {unit.description && (
                                  <p className="text-sm text-gray-300 mt-1">{unit.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                  onClick={() => startEdit(unit)}
                                  variant="secondary"
                                  size="sm"
                              >
                                Edit
                              </Button>
                              <button
                                  onClick={() => handleDelete(unit.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                  title="Delete category"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </div>
            </div>


          </div>
      </div>
    </div>
  );
};

export default UnitPage;
