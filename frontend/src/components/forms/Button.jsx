/**
 * Button Component
 *
 * Reusable button with loading state, variants, and elegant design
 */

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  className = ''
}) => {
  const baseStyles = `
    rounded-lg font-semibold tracking-wide transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#101922] 
    inline-flex items-center justify-center gap-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
  `;

  const sizeStyles = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-10 text-xl'
  };

  const variants = {
    primary: `
      bg-blue-600 text-white 
      hover:bg-blue-700
      hover:shadow-lg hover:shadow-blue-500/20
      active:scale-98
      focus:ring-blue-400
    `,

    secondary: `
      bg-slate-700 text-white 
      hover:bg-slate-800
      hover:shadow-lg hover:shadow-slate-600/20
      active:scale-98
      focus:ring-slate-500
    `,

    danger: `
      bg-red-600 text-white 
      hover:bg-red-700
      hover:shadow-lg hover:shadow-red-500/20
      active:scale-98
      focus:ring-red-400
    `,

    success: `
      bg-green-600 text-white 
      hover:bg-green-700
      hover:shadow-lg hover:shadow-green-500/20
      active:scale-98
      focus:ring-green-400
    `,

    ghost: `
      bg-transparent text-blue-400 border border-blue-400/50
      hover:bg-blue-500/10 hover:border-blue-400
      hover:shadow-md hover:shadow-blue-500/15
      active:scale-98
      focus:ring-blue-400
    `,

    outline: `
      bg-transparent text-slate-300 border border-slate-500/50
      hover:bg-slate-500/10 hover:border-slate-400
      hover:shadow-md hover:shadow-slate-500/15
      active:scale-98
      focus:ring-slate-400
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && (
            <span className="material-symbols-outlined text-lg transition-all duration-200">
              {icon}
            </span>
          )}
          <span className="relative">{children}</span>
        </>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'ghost', 'outline']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string
};

export default Button;
