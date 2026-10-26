import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * Layout wrapper component
 * - Header cố định ở trên
 * - Main content area với container max-width
 * - Min-height 100vh
 * - Background gradient subtle
 */
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background gradient pattern subtle */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient chính */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20" />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #a855f7 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
