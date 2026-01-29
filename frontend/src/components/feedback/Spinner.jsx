/**
 * Spinner Component
 *
 * Loading spinner for async operations
 */

import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({
  size = 'medium',
  className = '',
  fullScreen = false
}) => {
  const sizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinner = (
    <svg
      className={`animate-spin ${sizes[size]} ${className}`}
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#101922]/80 flex items-center justify-center z-50">
        <div className="text-white">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  fullScreen: PropTypes.bool
};

export default Spinner;

