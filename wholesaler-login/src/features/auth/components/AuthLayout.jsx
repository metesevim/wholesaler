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
    <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 18.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v9zm1.5-9a2 2 0 0 0-2-2h-13a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-9z"/>
      <path d="M3 7.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z"/>
    </svg>
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
            <BoxIcon />
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

