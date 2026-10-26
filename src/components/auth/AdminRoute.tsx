import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Admin Route wrapper
 * Chỉ cho phép admin truy cập
 * - Loading → LoadingSpinner
 * - Chưa đăng nhập → redirect /login
 * - Không phải admin → redirect /dashboard
 * - OK → render Outlet
 */
const AdminRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  // Đang tải thông tin xác thực
  if (loading) {
    return <LoadingSpinner fullScreen text="Đang xác thực..." />;
  }

  // Chưa đăng nhập → chuyển hướng về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Không phải admin → chuyển về dashboard
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin hợp lệ → render nội dung con
  return <Outlet />;
};

export default AdminRoute;
