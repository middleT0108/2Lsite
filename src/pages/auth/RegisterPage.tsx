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
import PasswordStrengthBar from '../../components/ui/PasswordStrengthBar';
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
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl" />

      {/* Card đăng ký */}
      <div className="relative w-full max-w-md z-10">
        {/* Gradient border wrapper */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-cyan-500">
          <div className="bg-gray-900 rounded-2xl p-8">
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
                {/* Thanh đo độ mạnh mật khẩu */}
                {watchedPassword && (
                  <div className="mt-2">
                    <PasswordStrengthBar password={watchedPassword} />
                  </div>
                )}
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
