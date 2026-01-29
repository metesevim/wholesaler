/**
 * Input Component
 *
 * Reusable input field with icon support and error handling
 */

import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  value,
  onChange,
  onKeyPress,
  placeholder,
  icon: Icon,
  error,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="relative flex w-full items-center">
        {Icon && (
          <Icon className="absolute left-3 w-6 h-6 text-[#92adc9]" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          className={`
            h-12 w-full rounded-lg border bg-[#192633] text-base text-white 
            placeholder-[#92adc9] focus:outline-none
            ${Icon ? 'pl-10' : 'pl-4'} pr-4
            ${error ? 'border-red-500' : 'border-[#324d67] focus:border-[#137fec]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Input;

