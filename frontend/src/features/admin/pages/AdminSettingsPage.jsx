/**
 * AdminSettingsPage Component
 *
 * Admin account settings page - allows editing admin profile information
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import Button from '../../../components/forms/Button';
import Input from '../../../components/forms/Input';
import PageHeader from '../../../components/layout/PageHeader';
import Message from '../../../components/feedback/Message';
import { ROUTES } from '../../../shared/constants/appConstants';

const AdminSettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    iban: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Pre-fill form with current user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        fullName: user.name || '',
        iban: user.iban || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'Username is required';
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.fullName || formData.fullName.trim() === '') {
      newErrors.fullName = 'Full name is required';
    }

    // Password change validation (optional but if provided, must validate)
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }

      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Prepare update payload
      const updateData = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        iban: formData.iban
      };

      // Only include password fields if user is changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Call the updateProfile API
      const result = await updateProfile(updateData);

      if (result.success) {
        setMessage('Profile updated successfully!');
        setMessageType('success');

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(result.message || 'Failed to update profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred while updating profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[#101922] p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Admin Account Settings"
          showDashboardButton={true}
        />

        <div className="bg-[#192633] rounded-lg border border-[#324d67] p-8 mt-8">
          {message && (
            <Message type={messageType} className="mb-6">
              {message}
            </Message>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Profile Information</h3>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  error={errors.fullName}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  error={errors.username}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  error={errors.email}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  IBAN
                </label>
                <Input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="Enter your IBAN"
                  error={errors.iban}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4 pt-6 border-t border-[#324d67]">
              <h3 className="text-lg font-bold text-white">Change Password (Optional)</h3>
              <p className="text-sm text-[#92adc9]">Leave blank if you don't want to change your password</p>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  error={errors.currentPassword}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  error={errors.newPassword}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  error={errors.confirmPassword}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-[#324d67]">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
