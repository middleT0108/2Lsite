import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ShieldOff } from 'lucide-react';

/**
 * Protected Route wrapper
 * Kiểm tra xác thực và trạng thái tài khoản trước khi cho phép truy cập
 * - Loading → LoadingSpinner fullScreen
 * - Chưa đăng nhập → redirect /login
 * - Tài khoản bị khóa → hiển thị trang thông báo
 * - OK → render Outlet (nội dung con)
 */
const ProtectedRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  // Đang tải thông tin xác thực
  if (loading) {
    return <LoadingSpinner fullScreen text="Đang xác thực..." />;
  }

  // Chưa đăng nhập → chuyển hướng về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Tài khoản bị khóa → hiển thị thông báo
  if (profile?.is_banned) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon cảnh báo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30">
            <ShieldOff className="w-10 h-10 text-red-400" />
          </div>

          {/* Tiêu đề */}
          <h1 className="text-2xl font-bold text-white">
            Tài khoản bị khóa
          </h1>

          {/* Mô tả */}
          <p className="text-slate-400 leading-relaxed">
            Tài khoản của bạn đã bị khóa bởi quản trị viên. 
            Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ hỗ trợ.
          </p>

          {/* Thông tin liên hệ */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-500">
              Email hỗ trợ:{' '}
              <a
                href="mailto:support@gameclips.com"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                support@gameclips.com
              </a>
            </p>
          </div>

          {/* Nút đăng xuất */}
          <div className="pt-2">
            <p className="text-xs text-slate-600">
              Bạn có thể đăng xuất và thử đăng nhập lại bằng tài khoản khác.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tài khoản hợp lệ → render nội dung con
  return <Outlet />;
};

export default ProtectedRoute;
