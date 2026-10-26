import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { resetPasswordSchema } from '../../lib/validators';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordStrengthBar from '../../components/ui/PasswordStrengthBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Type cho form đặt lại mật khẩu
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Cấu hình form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = watch('password', '');

  // Kiểm tra access_token trong hash URL khi component mount
  useEffect(() => {
    const checkToken = () => {
      // Lấy hash từ URL (HashRouter sẽ có dạng #/reset-password#access_token=...)
      const hash = window.location.hash;

      // Tìm access_token trong hash
      const hasAccessToken =
        hash.includes('access_token=') || hash.includes('type=recovery');

      if (hasAccessToken) {
        setHasToken(true);
      } else {
        // Kiểm tra session hiện tại (có thể Supabase đã tự động xử lý token)
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setHasToken(true);
          } else {
            setHasToken(false);
            // Redirect nếu không có token
            navigate('/forgot-password', { replace: true });
          }
        });
      }
    };

    checkToken();
  }, [navigate]);

  // Xử lý đặt mật khẩu mới
  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Cập nhật mật khẩu thông qua Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      showToast('Đặt lại mật khẩu thành công!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị loading khi đang kiểm tra token
  if (hasToken === null) {
    return <LoadingSpinner fullScreen text="Đang xác thực..." />;
  }

  // Nếu không có token, component sẽ redirect (được xử lý trong useEffect)
  if (!hasToken) {
    return null;
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

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl" />

      {/* Card đặt lại mật khẩu */}
      <div className="relative w-full max-w-md z-10">
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-500 to-purple-500">
          <div className="bg-gray-900 rounded-2xl p-8">
            {/* Tiêu đề */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Đặt lại mật khẩu
              </h1>
              <p className="text-gray-400 mt-2">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
            </div>

            {/* Hiển thị lỗi */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form đặt mật khẩu mới */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                {watchedPassword && (
                  <div className="mt-2">
                    <PasswordStrengthBar password={watchedPassword} />
                  </div>
                )}
              </div>

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                <Lock className="w-5 h-5 mr-2" />
                Xác nhận mật khẩu mới
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
