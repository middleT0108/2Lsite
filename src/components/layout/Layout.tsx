import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MotionBackground from './MotionBackground';

/**
 * Layout wrapper component
 * - Motion background sống động toàn hệ thống
 * - Header cố định ở trên
 * - Main content area với container max-width
 */
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative z-0">
      {/* Motion Background chuyển động mượt mà */}
      <MotionBackground />

      {/* Wrapper nội dung phía trên background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
