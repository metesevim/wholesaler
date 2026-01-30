/**
 * AuthLayout Component
 *
 * Layout for authentication pages (login, register)
 * Includes branding and decorative elements
 */

import React from 'react';
import PropTypes from 'prop-types';
import { APP_NAME } from '../../../shared/constants/appConstants';

const AuthLayout = ({ children }) => {
  const BoxIcon = () => (
      <span className="material-symbols-outlined text-4xl fill: 100">
          local_shipping
              </span>
  );

  return (
    <div className="min-h-screen bg-[#101922] grid grid-cols-1 lg:grid-cols-2">
      {/* Left Pane - Branding */}
      <div className="relative hidden lg:flex flex-col justify-end bg-[#111a22] p-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&auto=format&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 flex flex-col gap-4 text-white">
          <div className="flex items-center gap-3">
            <BoxIcon/>
            <p className="text-2xl font-bold">{APP_NAME}</p>
          </div>
          <h1 className="text-4xl font-black leading-tight">
            Your Partner in Wholesale Efficiency
          </h1>
          <p className="text-base text-white/80">
            Log in to access your dashboard and manage your operations seamlessly.
          </p>
        </div>
      </div>

      {/* Right Pane - Content */}
      <div className="flex flex-col items-center justify-center bg-[#101922] p-6 sm:p-8">
        <div className="flex w-full max-w-md flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthLayout;

