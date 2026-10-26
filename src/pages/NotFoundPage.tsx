import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Gamepad2, Ghost } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden px-4">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Gradient orbs animated */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-ping" />

      {/* Content chính */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Icon ghost gaming */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600/20 to-red-600/20 border border-purple-500/30 mb-8 animate-bounce">
          <Ghost className="w-12 h-12 text-purple-400" />
        </div>

        {/* Số 404 lớn với gaming style */}
        <div className="relative mb-6">
          <h1
            className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter"
            style={{
              background:
                'linear-gradient(135deg, #a855f7, #ec4899, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            404
          </h1>
          {/* Glitch effect overlay */}
          <div
            className="absolute inset-0 text-[120px] sm:text-[160px] font-black leading-none tracking-tighter opacity-20 animate-pulse"
            style={{
              background:
                'linear-gradient(135deg, #06b6d4, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transform: 'translate(2px, -2px)',
            }}
          >
            404
          </div>
        </div>

        {/* Tiêu đề lỗi */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Trang không tìm thấy
        </h2>

        {/* Thông điệp gaming */}
        <p className="text-gray-400 text-lg mb-2">
          Có vẻ bạn đã lạc vào một map chưa được mở khóa!
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        {/* Gaming tips */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 mb-8 inline-block">
          <div className="flex items-center gap-2 text-sm">
            <Gamepad2 className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-semibold">PRO TIP:</span>
            <span className="text-gray-400">
              Nhấn nút bên dưới để quay về base
            </span>
          </div>
        </div>

        {/* Nút về trang chủ */}
        <div className="flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
