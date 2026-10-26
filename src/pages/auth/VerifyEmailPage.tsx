import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { APP_CONFIG } from '../../types';

const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden px-4">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Gradient orbs trang trí */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-green-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl" />

      {/* Card thông báo */}
      <div className="relative w-full max-w-md z-10">
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-green-500 via-cyan-500 to-green-500">
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            {/* Animated email icon */}
            <div className="relative inline-flex items-center justify-center mb-6">
              {/* Vòng tròn ngoài animate pulse */}
              <div className="absolute w-24 h-24 rounded-full bg-green-500/10 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                <Mail className="w-10 h-10 text-white" />
              </div>
              {/* Biểu tượng check nhỏ */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-gray-900">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-2xl font-bold text-white mb-3">
              Kiểm tra email của bạn
            </h1>

            {/* Thông báo chi tiết */}
            <p className="text-gray-400 mb-2 leading-relaxed">
              Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Vui lòng kiểm tra hộp thư (bao gồm thư mục spam) và nhấn vào
              liên kết xác nhận để hoàn tất đăng ký tài khoản{' '}
              <span className="text-cyan-400 font-semibold">
                {APP_CONFIG.APP_NAME}
              </span>
              .
            </p>

            {/* Các bước hướng dẫn */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-8 text-left">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Các bước tiếp theo:
              </h3>
              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Mở hộp thư email của bạn
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Tìm email từ {APP_CONFIG.APP_NAME}
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  Nhấn vào liên kết xác nhận trong email
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </span>
                  Quay lại đăng nhập
                </li>
              </ol>
            </div>

            {/* Nút quay lại đăng nhập */}
            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
