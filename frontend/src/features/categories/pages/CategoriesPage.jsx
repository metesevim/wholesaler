/**
 * CategoriesPage Component
 *
 * Page for viewing and managing categories
 */

import React, { useState, useEffect } from 'react';
import Button from '../../../components/forms/Button';
import PageHeader from '../../../components/layout/PageHeader';
import Sidebar from '../../../components/layout/Sidebar';
import { categoryRepository } from '../../../data';
import { ROUTES } from '../../../shared/constants/appConstants';
import logger from '../../../shared/utils/logger';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFormData, setNewFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await categoryRepository.getAllCategories();
      if (result.success) {
        setCategories(result.data || []);
      } else {
        setError(result.error || 'Failed to load categories');
      }
    } catch (err) {
      logger.error('Failed to load categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData) => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }


    return newErrors;
  };

  const handleAddNew = async (e) => {
    e.preventDefault();

    const newErrors = validateForm(newFormData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await categoryRepository.createCategory({
        name: newFormData.name,
        description: newFormData.description
      });

      if (result.success) {
        setSuccess('Category created successfully!');
        setCategories([...categories, result.data]);
        setNewFormData({ name: '', description: '' });
        setIsAddingNew(false);
        setErrors({});
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to create category');
      }
    } catch (err) {
      logger.error('Failed to create category:', err);
      setError('Failed to create category. Please try again.');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditFormData({
      name: category.name,
      description: category.description
    });
    setErrors({});
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm(editFormData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await categoryRepository.updateCategory(editingId, {
        name: editFormData.name,
        description: editFormData.description
      });

      if (result.success) {
        setSuccess('Category updated successfully!');
        setCategories(categories.map(cat =>
          cat.id === editingId ? result.data : cat
        ));
        setEditingId(null);
        setErrors({});
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update category');
      }
    } catch (err) {
      logger.error('Failed to update category:', err);
      setError('Failed to update category. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const result = await categoryRepository.deleteCategory(id);

        if (result.success) {
          setSuccess('Category deleted successfully!');
          setCategories(categories.filter(cat => cat.id !== id));
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(result.error || 'Failed to delete category');
        }
      } catch (err) {
        logger.error('Failed to delete category:', err);
        setError('Failed to delete category. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setErrors({});
    setNewFormData({ name: '', description: '' });
    setEditFormData({ name: '', description: '' });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#101922] flex">
      <Sidebar activeRoute={ROUTES.CATEGORIES} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Categories"
            subtitle="Manage your item categories"
            rightContent={
              !isAddingNew && (
                <Button
                  onClick={() => setIsAddingNew(true)}
                  variant="primary"
                  size="md"
                >
                  + Add Category
                </Button>
              )
            }
          />

          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search categories by name or description..."
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

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
              <Button onClick={() => setError(null)} variant="secondary" className="mt-3" size="sm">
                Dismiss
              </Button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900 border border-green-500 rounded-lg">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {/* Add New Category Form */}
          {isAddingNew && (
            <div className="mb-6 bg-[#192633] rounded-lg p-6 border border-[#324d67]">
              <h3 className="text-lg font-bold text-white mb-4">Add New Category</h3>
              <form onSubmit={handleAddNew} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newFormData.name}
                      onChange={(e) => {
                        setNewFormData({ ...newFormData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="Enter category name"
                      className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
                        placeholder-[#92adc9] focus:outline-none focus:border-[#137fec] ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.name && <p className="mt-2 text-xs text-red-400">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newFormData.description}
                      onChange={(e) => {
                        setNewFormData({ ...newFormData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: '' });
                      }}
                      placeholder="Enter description (optional)"
                      className={`w-full h-12 rounded-lg border border-[#324d67] bg-[#192633] text-white px-4
                        placeholder-[#92adc9] focus:outline-none focus:border-[#137fec] ${
                        errors.description ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.description && <p className="mt-2 text-xs text-red-400">{errors.description}</p>}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-[#324d67]">
                  <Button type="submit" variant="primary" className="flex-1">
                    Create Category
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <svg className="w-12 h-12 text-[#137fec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="ml-4 text-white">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#92adc9] text-lg mb-4">No categories found</p>
              <Button
                onClick={() => setIsAddingNew(true)}
                variant="primary"
              >
                Create Your First Category
              </Button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#92adc9] text-lg mb-4">No categories match your search</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className="bg-[#192633] rounded-lg border border-[#324d67] p-4 hover:border-[#137fec] transition-colors"
                >
                  {editingId === category.id ? (
                    // Edit Form
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white font-semibold mb-2">Name</label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => {
                              setEditFormData({ ...editFormData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            placeholder="Enter category name"
                            className={`w-full h-10 rounded-lg border border-[#324d67] bg-[#192633] text-white px-3
                              placeholder-[#92adc9] focus:outline-none focus:border-[#137fec] ${
                              errors.name ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                        </div>

                        <div>
                          <label className="block text-white font-semibold mb-2">Description</label>
                          <input
                            type="text"
                            value={editFormData.description}
                            onChange={(e) => {
                              setEditFormData({ ...editFormData, description: e.target.value });
                              if (errors.description) setErrors({ ...errors, description: '' });
                            }}
                            placeholder="Enter description (optional)"
                            className={`w-full h-10 rounded-lg border border-[#324d67] bg-[#192633] text-white px-3
                              placeholder-[#92adc9] focus:outline-none focus:border-[#137fec] ${
                              errors.description ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-[#324d67]">
                        <Button type="submit" variant="primary" size="sm" className="flex-1">
                          Save Changes
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleCancel} size="sm" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                        <p className="text-sm text-[#92adc9]">{category.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(category)}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id)}
                          variant="danger"
                          size="sm"
                        >
                          Delete
                        </Button>
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

export default CategoriesPage;
