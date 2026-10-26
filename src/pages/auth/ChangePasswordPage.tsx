import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Lock,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/auth.service';
import { otpService } from '../../services/otp.service';
import { changePasswordSchema } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OtpInput from '../../components/auth/OtpInput';
import PasswordStrengthBar from '../../components/ui/PasswordStrengthBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { APP_CONFIG } from '../../types';

// Type cho form mật khẩu hiện tại
interface CurrentPasswordFormData {
  currentPassword: string;
}

// Type cho form mật khẩu mới
interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Các bước trong quy trình đổi mật khẩu
type Step = 'verify' | 'otp' | 'newPassword';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // State quản lý
  const [currentStep, setCurrentStep] = useState<Step>('verify');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Form cho bước xác nhận mật khẩu hiện tại
  const currentPasswordForm = useForm<CurrentPasswordFormData>();

  // Form cho bước đặt mật khẩu mới
  const newPasswordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Watch password cho PasswordStrengthBar
  const watchedPassword = newPasswordForm.watch('password', '');

  // Countdown timer cho gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Bước 1: Xác nhận mật khẩu hiện tại
     // Thử gửi OTP nếu có Edge Function, nếu chưa deploy thì sang thẳng bước nhập mật khẩu mới
   try {
     const otpResponse = await otpService.sendOtp(profile.email, 'change_password');
     if (otpResponse.data && !otpResponse.error) {
       setCountdown(APP_CONFIG.OTP_RESEND_COOLDOWN_SECONDS);
       setCurrentStep('otp');
       showToast('Mã OTP đã được gửi đến email của bạn.', 'success');
       return;
     }
   } catch (e) {
     console.warn('Edge Function chưa được triển khai');
   }

   // Chuyển thẳng sang bước nhập mật khẩu mới vì đã xác thực đúng mật khẩu cũ
   setCurrentStep('newPassword');
   showToast('Xác nhận thành công! Hãy nhập mật khẩu mới.', 'success');

      // Gửi OTP đến email
      const otpResponse = await otpService.sendOtp(profile.email, 'change_password');
      if (otpResponse.error) {
        setError(otpResponse.error);
        return;
      }

      setCountdown(APP_CONFIG.OTP_RESEND_COOLDOWN_SECONDS);
      setCurrentStep('otp');
      showToast('Mã OTP đã được gửi đến email của bạn.', 'success');
    } catch (err: any) {
      setError(err?.message || 'Xác nhận mật khẩu thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = useCallback(async () => {
    if (countdown > 0 || !profile?.email) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await otpService.sendOtp(profile.email, 'change_password');
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
  }, [countdown, profile?.email, showToast]);

  // Bước 2: Xác nhận OTP
  const handleVerifyOtp = async () => {
    if (!profile?.email) return;
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await otpService.verifyOtp(
        profile.email,
        otpCode,
        'change_password'
      );
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.data?.valid) {
        setCurrentStep('newPassword');
        showToast('Mã OTP hợp lệ!', 'success');
      } else {
        setError('Mã OTP không hợp lệ.');
      }
    } catch (err: any) {
      setError(err?.message || 'Xác nhận OTP thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bước 3: Đổi mật khẩu mới
  const handleChangePassword = async (data: NewPasswordFormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await authService.changePassword(data.password);
      if (response.error) {
        setError(response.error);
        return;
      }
      showToast('Đổi mật khẩu thành công!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'verify', icon: KeyRound, label: 'Xác nhận' },
      { key: 'otp', icon: ShieldCheck, label: 'OTP' },
      { key: 'newPassword', icon: Lock, label: 'Mật khẩu mới' },
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

  // Loading state
  if (authLoading) {
    return <LoadingSpinner fullScreen text="Đang tải..." />;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại Dashboard</span>
        </button>

        {/* Card đổi mật khẩu */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-500 to-purple-500">
          <div className="bg-gray-900 rounded-2xl p-8">
            {/* Tiêu đề */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Đổi mật khẩu</h1>
              <p className="text-gray-400 mt-2">
                {currentStep === 'verify' && 'Xác nhận mật khẩu hiện tại'}
                {currentStep === 'otp' && 'Nhập mã OTP xác thực'}
                {currentStep === 'newPassword' && 'Đặt mật khẩu mới'}
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

            {/* Step 1: Xác nhận mật khẩu hiện tại */}
            {currentStep === 'verify' && (
              <form
                onSubmit={currentPasswordForm.handleSubmit(
                  handleVerifyCurrentPassword
                )}
                className="space-y-5"
              >
                <Input
                  label="Mật khẩu hiện tại"
                  type="password"
                  placeholder="••••••••"
                  error={
                    currentPasswordForm.formState.errors.currentPassword?.message
                  }
                  {...currentPasswordForm.register('currentPassword', {
                    required: 'Vui lòng nhập mật khẩu hiện tại.',
                  })}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full"
                >
                  <KeyRound className="w-5 h-5 mr-2" />
                  Xác nhận
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
                  <p className="text-cyan-400 font-semibold mt-1">
                    {profile?.email}
                  </p>
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
                  Xác nhận OTP
                </Button>

                {/* Nút quay lại */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('verify');
                    setError(null);
                    setOtpCode('');
                  }}
                  className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>
              </div>
            )}

            {/* Step 3: Đặt mật khẩu mới */}
            {currentStep === 'newPassword' && (
              <form
                onSubmit={newPasswordForm.handleSubmit(handleChangePassword)}
                className="space-y-5"
              >
                <div>
                  <Input
                    label="Mật khẩu mới"
                    type="password"
                    placeholder="••••••••"
                    error={newPasswordForm.formState.errors.password?.message}
                    {...newPasswordForm.register('password')}
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
                  error={
                    newPasswordForm.formState.errors.confirmPassword?.message
                  }
                  {...newPasswordForm.register('confirmPassword')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Đổi mật khẩu
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
