import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Gamepad2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordStrengthBar from '../../components/ui/PasswordStrengthBar';

// Schema xác thực form đăng ký
const registerFormSchema = z
  .object({
    username: z
      .string()
      .min(2, 'Tên người dùng phải có ít nhất 2 ký tự')
      .max(30, 'Tên người dùng tối đa 30 ký tự')
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z
      .string()
      .min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  // Khai báo đầy đủ cả signUp và signIn từ useAuth để không bao giờ bị lỗi undefined
  const { user, loading: authLoading, signUp, signIn } = useAuth();
  const { showToast } = useToast();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password', '');

  // Redirect nếu đã đăng nhập từ trước
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
      const cleanUsername = data.username?.trim() || data.email.split('@')[0];
      
      // Lưu trước tên hiển thị vào bộ nhớ cục bộ
      localStorage.setItem('2lsite_username', cleanUsername);

      const res = await signUp(data.email.trim(), data.password, cleanUsername);
      
      if (res?.error) {
        setRegisterError(res.error);
        return;
      }

      showToast('Đăng ký thành công! Vui lòng kiểm tra Gmail để xác nhận tài khoản.', 'success');
      // Chuyển sang trang hướng dẫn kiểm tra hòm thư Gmail
      navigate('/verify-email', { replace: true });
    } catch (error: any) {
      const message = error?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      setRegisterError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden px-4 py-12">
      {/* Background Neon Grid Gaming */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-purple-500/50 via-cyan-500/50 to-purple-500/50 shadow-2xl">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-7">
            {/* Header Icon & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/40 mb-3">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Tạo tài khoản 2Lsite</h1>
              <p className="text-xs text-slate-400 mt-1">Bắt đầu lưu trữ highlight gaming của bạn</p>
            </div>

            {/* Thông báo lỗi tổng quát */}
            {registerError && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                <span>{registerError}</span>
              </div>
            )}

            {/* Form đăng ký */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Tên người dùng (Display Name)"
                  type="text"
                  placeholder="Ví dụ: Trung, GamerPro..."
                  error={errors.username?.message}
                  {...register('username')}
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="name@gmail.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div>
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="Tối thiểu 8 ký tự"
                  error={errors.password?.message}
                  {...register('password')}
                />
                {watchedPassword && (
                  <div className="mt-2">
                    <PasswordStrengthBar password={watchedPassword} />
                  </div>
                )}
              </div>

              <div>
                <Input
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                className="w-full mt-2"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Đăng ký
              </Button>
            </form>

            {/* Footer chuyển sang đăng nhập */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
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
