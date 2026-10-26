import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  ArrowLeft,
  Mail,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Bước 1: 'input_email' -> Bước 2: 'enter_otp' (gửi mã đổi mật khẩu về mail)
  const [step, setStep] = useState<'input_email' | 'enter_otp'>('input_email');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Đếm ngược 60 giây khi gửi lại mã
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Kiểm tra trạng thái xác thực của email trước khi gửi mã
  const handleCheckEmailAndSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Kiểm tra tài khoản xem đã xác minh Gmail hay chưa
      const { data: statusData, error: statusErr } = await supabase.rpc('check_user_email_status', {
        user_email: cleanEmail,
      });

      if (!statusErr && statusData) {
        if (!statusData.exists) {
          setError('Email này chưa được đăng ký trong hệ thống');
          setIsSubmitting(false);
          return;
        }

        // ĐIỀU KIỆN QUAN TRỌNG: Nếu mail chưa được xác minh trong tài khoản
        if (!statusData.confirmed) {
          setError('mail chưa được xác minh trong tài khoản');
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Nếu đã xác minh: Thực hiện gửi mã đổi mật khẩu về mail
      const redirectUrl = window.location.origin + window.location.pathname + '#/reset-password';
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (resetErr) {
        if (resetErr.message?.toLowerCase().includes('not confirmed')) {
          setError('mail chưa được xác minh trong tài khoản');
          setIsSubmitting(false);
          return;
        }
        throw resetErr;
      }

      // 3. Chuyển tiếp thành công sang bước "Gửi mã đổi mật khẩu về mail"
      showToast('Đã gửi mã đổi mật khẩu về mail thành công!', 'success');
      setStep('enter_otp');
      setCountdown(60);
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi mã lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xác nhận đổi mật khẩu với mã đã gửi về mail
  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setError('Vui lòng nhập mã đổi mật khẩu từ email');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);

    try {
      // Xác thực mã OTP loại recovery
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanOtp,
        type: 'recovery',
      });

      if (otpError) {
        throw new Error('Mã đổi mật khẩu không đúng hoặc đã hết hạn.');
      }

      // Cập nhật mật khẩu mới
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      showToast('Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...', 'success');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {/* Header Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/40 mb-3">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Khôi phục mật khẩu</h1>
              <p className="text-xs text-slate-400 mt-1">
                {step === 'input_email'
                  ? 'Chỉ tài khoản đã xác minh Gmail mới có thể khôi phục mật khẩu'
                  : 'Gửi mã đổi mật khẩu về mail thành công'}
              </p>
            </div>

            {/* Thông báo lỗi (Hiển thị chính xác dòng lỗi theo yêu cầu) */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 shadow-lg animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* BƯỚC 1: NHẬP EMAIL ĐỂ KIỂM TRA */}
            {step === 'input_email' && (
              <form onSubmit={handleCheckEmailAndSendReset} className="space-y-4">
                <Input
                  label="Email tài khoản"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="name@gmail.com"
                  required
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Gửi mã đổi mật khẩu về mail
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}

            {/* BƯỚC 2: TÀI KHOẢN ĐÃ XÁC MINH - NHẬP MÃ ĐỔI MẬT KHẨU TỪ EMAIL */}
            {step === 'enter_otp' && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã gửi mã đổi mật khẩu về mail!</span>
                  </div>
                  <p className="text-slate-300">
                    Mã xác nhận đã gửi đến: <strong className="text-white">{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                  <Input
                    label="Mã đổi mật khẩu (Mã số trong email)"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Nhập mã số nhận được"
                    autoFocus
                  />

                  <Input
                    label="Mật khẩu mới"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập bất kỳ ký tự nào (tối thiểu 6)"
                  />

                  <Input
                    label="Nhập lại mật khẩu mới"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu trên"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isSubmitting}
                    className="w-full"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Xác nhận đổi mật khẩu
                  </Button>
                </form>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input_email');
                      setError(null);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ← Đổi email khác
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 0 || isSubmitting}
                    onClick={handleCheckEmailAndSendReset}
                    className={`inline-flex items-center gap-1 ${
                      countdown > 0
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-purple-400 hover:text-purple-300'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
