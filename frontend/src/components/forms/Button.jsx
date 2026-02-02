/**
 * Button Component
 *
 * Reusable button with loading state, variants, and premium design
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
    rounded-lg font-semibold tracking-wider transition-all duration-300 
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
      bg-gradient-to-br from-blue-500 via-blue-550 to-blue-600 text-white 
      hover:from-blue-600 hover:via-blue-620 hover:to-blue-700
      hover:shadow-2xl hover:shadow-blue-500/40
      active:scale-95 active:shadow-blue-500/20
      focus:ring-blue-400
      before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:hover:opacity-10 before:transition-opacity before:duration-300
    `,

    secondary: `
      bg-gradient-to-br from-slate-600 via-slate-650 to-slate-700 text-white 
      hover:from-slate-700 hover:via-slate-750 hover:to-slate-800
      hover:shadow-2xl hover:shadow-slate-600/30
      active:scale-95 active:shadow-slate-600/20
      focus:ring-slate-500
      before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:hover:opacity-10 before:transition-opacity before:duration-300
    `,

    danger: `
      bg-gradient-to-br from-red-500 via-red-550 to-red-600 text-white 
      hover:from-red-600 hover:via-red-620 hover:to-red-700
      hover:shadow-2xl hover:shadow-red-500/40
      active:scale-95 active:shadow-red-500/20
      focus:ring-red-400
      before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:hover:opacity-10 before:transition-opacity before:duration-300
    `,

    success: `
      bg-gradient-to-br from-green-500 via-green-550 to-green-600 text-white 
      hover:from-green-600 hover:via-green-620 hover:to-green-700
      hover:shadow-2xl hover:shadow-green-500/40
      active:scale-95 active:shadow-green-500/20
      focus:ring-green-400
      before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:hover:opacity-10 before:transition-opacity before:duration-300
    `,

    ghost: `
      bg-transparent text-blue-400 border-2 border-blue-400/60
      hover:bg-blue-500/15 hover:border-blue-400
      hover:shadow-lg hover:shadow-blue-500/25
      active:scale-95 active:bg-blue-500/20
      focus:ring-blue-400
      transition-all duration-300
    `,

    outline: `
      bg-transparent text-slate-300 border-2 border-slate-500/60
      hover:bg-slate-500/15 hover:border-slate-400
      hover:shadow-lg hover:shadow-slate-500/25
      active:scale-95 active:bg-slate-500/20
      focus:ring-slate-400
      transition-all duration-300
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
            <span className="material-symbols-outlined text-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
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
