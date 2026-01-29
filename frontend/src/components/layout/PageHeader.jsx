/**
 * PageHeader Component
 *
 * Reusable header for all protected pages with navigation to dashboard
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../forms/Button';
import { ROUTES } from '../../shared/constants/appConstants';

const PageHeader = ({
  title,
  subtitle = null,
  showDashboardButton = true,
  rightContent = null
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && (
          <p className="text-[#92adc9]">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {rightContent}
        {showDashboardButton && (
          <Button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            variant="secondary"
            title="Back to Dashboard"
          >
            ← Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
