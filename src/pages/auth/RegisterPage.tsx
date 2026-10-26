import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Gamepad2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { registerSchema } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import MotionBackground from '../../components/layout/MotionBackground';
import { APP_CONFIG } from '../../types';

// Định nghĩa type cho form đăng ký
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signUp } = useAuth();
  const { showToast } = useToast();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cấu hình react-hook-form với zod validation
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Watch password để truyền cho PasswordStrengthBar
  const watchedPassword = watch('password', '');

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Xử lý đăng ký
  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    setIsSubmitting(true);
    try {
      const res = await signUp(data.email, data.password);
      if (res?.error) {
        setRegisterError(res.error);
        showToast(res.error, 'error');
      } else {
        // Tự động đăng nhập luôn sau khi đăng ký
        await signIn(data.email, data.password);
        showToast('Đăng ký tài khoản thành công!', 'success');
        window.location.hash = '#/dashboard';
      }
    } catch (error: any) {
      const message =
        error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setRegisterError(message);
      showToast(message, 'error');
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Motion Background sống động */}
      <MotionBackground />

      {/* Card đăng ký */}
      <div className="relative w-full max-w-md z-10">
        {/* Gradient border wrapper */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/80 via-purple-500/80 to-cyan-500/80 shadow-2xl shadow-cyan-950/50">
          <div className="bg-gray-900/90 rounded-2xl p-8 backdrop-blur-md">
            {/* Logo và tiêu đề */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-600 mb-4">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Tạo tài khoản {APP_CONFIG.APP_NAME}
              </h1>
              <p className="text-gray-400 mt-2">
                Bắt đầu lưu trữ highlight gaming của bạn
              </p>
            </div>

            {/* Hiển thị lỗi đăng ký */}
            {registerError && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{registerError}</p>
              </div>
            )}

            {/* Form đăng ký */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
              label="Tên người dùng (Display Name)"
              type="text"
              placeholder="Ví dụ: FakerVN, GamerPro..."
              error={errors.username?.message}
              {...register('username')}
  />
              
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {/* Nút đăng ký */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Đăng ký
              </Button>
            </form>

            {/* Link đăng nhập */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
