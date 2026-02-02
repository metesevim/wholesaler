/**
 * Switch Component
 *
 * Toggle switch for boolean values
 */

import React from 'react';
import PropTypes from 'prop-types';

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  label = '',
  name = ''
}) => {
  return (
    <label className="flex items-center gap-2 p-3 rounded-lg bg-[#0d1117] cursor-pointer">
      <div className="relative inline-flex items-center flex-shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors ${
            checked ? 'bg-[#137fec]' : 'bg-[#324d67]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
      {label && (
        <span className="text-sm text-white font-medium flex-1">{label}</span>
      )}
    </label>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string
};

export default Switch;
