import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MotionBackground from './MotionBackground';

/**
 * Layout wrapper component
 * - Header cố định ở trên
 * - Main content area với container max-width
 * - Motion background sống động toàn hệ thống
 */
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative">
      {/* Motion Background chuyển động mượt mà */}
      <MotionBackground />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
