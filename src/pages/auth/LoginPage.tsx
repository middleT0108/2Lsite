import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Gamepad2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { loginSchema } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { APP_CONFIG } from '../../types';

// Định nghĩa type cho form đăng nhập
interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn } = useAuth();
  const { showToast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cấu hình react-hook-form với zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Xử lý đăng nhập
  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
      showToast('Đăng nhập thành công!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      const message =
        error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setLoginError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị loading khi đang kiểm tra auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />

      {/* Card đăng nhập */}
      <div className="relative w-full max-w-md z-10">
        {/* Gradient border wrapper */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-500 to-purple-500">
          <div className="bg-gray-900 rounded-2xl p-8">
            {/* Logo và tiêu đề */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 mb-4">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {APP_CONFIG.APP_NAME}
              </h1>
              <p className="text-gray-400 mt-2">
                Đăng nhập để quản lý video gaming của bạn
              </p>
            </div>

            {/* Hiển thị lỗi đăng nhập */}
            {loginError && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{loginError}</p>
              </div>
            )}

            {/* Form đăng nhập */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Link quên mật khẩu */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Nút đăng nhập */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Đăng nhập
              </Button>
            </form>

            {/* Link đăng ký */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Đăng ký
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
