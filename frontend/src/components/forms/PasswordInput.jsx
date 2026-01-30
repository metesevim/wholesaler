/**
 * PasswordInput Component
 *
 * Password input field with show/hide toggle
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PasswordInput = ({
  value,
  onChange,
  onKeyPress,
  placeholder = 'Enter your password',
  error,
  disabled = false,
  icon: Icon
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const LockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="#92adc9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="#92adc9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="#92adc9" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  const IconComponent = Icon || LockIcon;

  return (
    <div className="flex flex-col w-full">
      <div className="relative flex w-full items-center">
        <div className="absolute left-3 flex items-center justify-center pointer-events-none">
          <IconComponent className="w-5 h-5 text-[#92adc9]" />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          className={`
            h-12 w-full rounded-lg border bg-[#192633] pl-11 pr-10 text-base text-white 
            placeholder-[#92adc9] focus:outline-none
            ${error ? 'border-red-500' : 'border-[#324d67] focus:border-[#137fec]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          placeholder={placeholder}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          type="button"
          className="absolute right-3 text-[#92adc9] hover:text-white focus:outline-none"
          disabled={disabled}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

PasswordInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType
};

export default PasswordInput;

