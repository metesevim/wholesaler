/**
 * TopBar Component
 *
 * Reusable top bar for main pages
 * Shows user info, role, and IBAN copy button
 */

import React from 'react';

const TopBar = ({ user }) => {
  return (
    <div className="bg-[#0d1117] border-b border-[#324d67] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Left Section - User Info */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-[#92adc9] font-semibold uppercase tracking-wider">Welcome back</p>
          <p className="text-lg font-bold text-white">
            {user?.name || user?.fullName || user?.username}
          </p>
        </div>
        <div className="w-px h-12 bg-[#324d67]"></div>
        <span className="px-4 py-2 bg-[#137fec]/15 text-[#137fec] rounded-lg text-xs font-bold uppercase tracking-wide border border-[#137fec]/30">
          {user?.role}
        </span>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Copy IBAN Button */}
        {user?.iban && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(user.iban);
              alert('IBAN copied to clipboard!');
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#137fec] bg-[#137fec]/10 border border-[#137fec]/30 hover:bg-[#137fec]/20 hover:border-[#137fec]/50 transition-all"
            title="Copy IBAN to clipboard"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">content_copy</span>
              IBAN
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
