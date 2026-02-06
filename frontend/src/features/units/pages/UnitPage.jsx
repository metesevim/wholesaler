import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import FormField from '../../../components/ui/FormField';
import logger from '../../../shared/utils/logger';

const UnitPage = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const response = await fetch('/api/units');
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
      const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units';
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
      const response = await fetch(`/api/units/${unitId}`, { method: 'DELETE' });
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Units Management</h1>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showCreateForm ? 'Cancel' : 'Add Unit'}
              </Button>
            </div>

            {showCreateForm && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">
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

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Available Units</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {units.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No units found. Create your first unit above.
                  </div>
                ) : (
                  units.map((unit) => (
                    <div key={unit.id} className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{unit.name}</h3>
                        {unit.description && (
                          <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
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
                        <Button
                          onClick={() => handleDelete(unit.id)}
                          variant="danger"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnitPage;
