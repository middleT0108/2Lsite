import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  KeyRound,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Lock,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { otpService } from '../../services/otp.service';
import { forgotPasswordSchema, resetPasswordSchema } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OtpInput from '../../components/auth/OtpInput';
import PasswordStrengthBar from '../../components/ui/PasswordStrengthBar';
import { APP_CONFIG } from '../../types';

// Định nghĩa form types
interface EmailFormData {
  email: string;
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Các bước trong quy trình quên mật khẩu
type Step = 'email' | 'otp' | 'reset';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State quản lý
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown cho gửi lại OTP (60 giây)
  const [countdown, setCountdown] = useState(0);

  // Form cho bước nhập email
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Form cho bước đặt mật khẩu mới
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Watch password cho PasswordStrengthBar
  const watchedPassword = resetForm.watch('password', '');

  // Xử lý countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Bước 1: Gửi OTP đến email
  const handleSendOtp = async (data: EmailFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await otpService.sendOtp(data.email, 'reset_password');
      if (response.error) {
        setError(response.error);
        return;
      }
      setEmail(data.email);
      setCountdown(APP_CONFIG.OTP_RESEND_COOLDOWN_SECONDS);
      setCurrentStep('otp');
      showToast('Mã OTP đã được gửi đến email của bạn.', 'success');
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await otpService.sendOtp(email, 'reset_password');
      if (response.error) {
        setError(response.error);
        return;
      }
      setCountdown(APP_CONFIG.OTP_RESEND_COOLDOWN_SECONDS);
      showToast('Đã gửi lại mã OTP.', 'success');
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsSubmitting(false);
    }
  }, [countdown, email, showToast]);

  // Bước 2: Xác nhận OTP
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await otpService.verifyOtp(email, otpCode, 'reset_password');
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.data?.valid) {
        setCurrentStep('reset');
        showToast('Mã OTP hợp lệ!', 'success');
      } else {
        setError('Mã OTP không hợp lệ. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err?.message || 'Xác nhận OTP thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bước 3: Đặt mật khẩu mới
  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await otpService.resetPasswordWithOtp(
        email,
        otpCode,
        data.password
      );
      if (response.error) {
        setError(response.error);
        return;
      }
      showToast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'success');
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render indicator cho các bước
  const renderStepIndicator = () => {
    const steps = [
      { key: 'email', icon: Mail, label: 'Email' },
      { key: 'otp', icon: ShieldCheck, label: 'OTP' },
      { key: 'reset', icon: Lock, label: 'Mật khẩu' },
    ];

    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <React.Fragment key={step.key}>
              {index > 0 && (
                <div
                  className={`h-0.5 w-8 rounded ${
                    isCompleted ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                />
              )}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400/50'
                    : isCompleted
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden px-4">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl" />

      {/* Card chính */}
      <div className="relative w-full max-w-md z-10">
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-500 to-purple-500">
          <div className="bg-gray-900 rounded-2xl p-8">
            {/* Tiêu đề */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
              <p className="text-gray-400 mt-2">
                {currentStep === 'email' && 'Nhập email để nhận mã OTP'}
                {currentStep === 'otp' && 'Nhập mã OTP đã gửi đến email'}
                {currentStep === 'reset' && 'Đặt mật khẩu mới cho tài khoản'}
              </p>
            </div>

            {/* Step indicator */}
            {renderStepIndicator()}

            {/* Hiển thị lỗi */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Nhập email */}
            {currentStep === 'email' && (
              <form
                onSubmit={emailForm.handleSubmit(handleSendOtp)}
                className="space-y-5"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  error={emailForm.formState.errors.email?.message}
                  {...emailForm.register('email')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Gửi mã OTP
                </Button>
              </form>
            )}

            {/* Step 2: Nhập OTP */}
            {currentStep === 'otp' && (
              <div className="space-y-5">
                {/* Thông báo email đã gửi */}
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Mã OTP đã được gửi đến
                  </p>
                  <p className="text-cyan-400 font-semibold mt-1">{email}</p>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center">
                  <OtpInput
                    length={6}
                    onComplete={(code) => setOtpCode(code)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Countdown và nút gửi lại */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-gray-500 text-sm">
                      Gửi lại mã sau{' '}
                      <span className="text-purple-400 font-semibold">
                        {countdown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Gửi lại mã
                    </button>
                  )}
                </div>

                {/* Nút xác nhận */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  onClick={handleVerifyOtp}
                  className="w-full"
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Xác nhận
                </Button>

                {/* Nút quay lại */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('email');
                    setError(null);
                    setOtpCode('');
                  }}
                  className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại nhập email
                </button>
              </div>
            )}

            {/* Step 3: Đặt mật khẩu mới */}
            {currentStep === 'reset' && (
              <form
                onSubmit={resetForm.handleSubmit(handleResetPassword)}
                className="space-y-5"
              >
                <div>
                  <Input
                    label="Mật khẩu mới"
                    type="password"
                    placeholder="••••••••"
                    error={resetForm.formState.errors.password?.message}
                    {...resetForm.register('password')}
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
                  error={resetForm.formState.errors.confirmPassword?.message}
                  {...resetForm.register('confirmPassword')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Đặt mật khẩu mới
                </Button>
              </form>
            )}

            {/* Link quay lại đăng nhập */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
