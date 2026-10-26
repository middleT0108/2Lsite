import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Palette,
  Check,
  ArrowLeft,
  Shield,
  Calendar,
  KeyRound,
  Sparkles,
  Smile,
  Save,
  Mail,
  MailCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { BackgroundTheme } from '../components/layout/MotionBackground';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>('cyber-purple');
  const [usernameInput, setUsernameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Trạng thái xác thực email
  const isEmailConfirmed = Boolean(user?.email_confirmed_at);
  const [sendingConfirm, setSendingConfirm] = useState(false);

  // Tên người dùng hiển thị: Ưu tiên username -> user_metadata -> tên trước dấu @ của email
  const displayName =
    profile?.username ||
    (user?.user_metadata?.username as string) ||
    (user?.user_metadata?.display_name as string) ||
    profile?.email?.split('@')[0] ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    const saved = (localStorage.getItem('2lsite_theme') as BackgroundTheme) || 'cyber-purple';
    setCurrentTheme(saved);
  }, []);

  // Điền tên người dùng hiện tại vào ô input
  useEffect(() => {
    if (profile?.username) {
      setUsernameInput(profile.username);
    } else if (user?.user_metadata?.username) {
      setUsernameInput(user.user_metadata.username as string);
    } else if (user?.email) {
      setUsernameInput(user.email.split('@')[0]);
    }
  }, [profile?.username, user]);

  const themes: { id: BackgroundTheme; name: string; desc: string; colors: string }[] = [
    {
      id: 'cyber-purple',
      name: 'Cyberpunk Purple (Mặc định)',
      desc: 'Tím Neon huyền ảo kết hợp Cyan',
      colors: 'from-purple-600 via-indigo-600 to-cyan-500',
    },
    {
      id: 'neon-blue',
      name: 'Electric Neon Blue',
      desc: 'Xanh dương công nghệ cao & sắc sảo',
      colors: 'from-cyan-500 via-blue-600 to-sky-400',
    },
    {
      id: 'matrix-green',
      name: 'Matrix Hacker Green',
      desc: 'Xanh ngọc lục bảo phong cách hacker',
      colors: 'from-emerald-500 via-teal-600 to-green-400',
    },
    {
      id: 'sunset-fire',
      name: 'Sunset Inferno',
      desc: 'Cam đỏ rực cháy nhiệt huyết gaming',
      colors: 'from-rose-600 via-orange-500 to-amber-400',
    },
    {
      id: 'galaxy-dark',
      name: 'Deep Galaxy',
      desc: 'Huyền bí tối giản như không gian vũ trụ',
      colors: 'from-indigo-900 via-purple-950 to-slate-900',
    },
  ];

  const handleSelectTheme = (themeId: BackgroundTheme) => {
    setCurrentTheme(themeId);
    localStorage.setItem('2lsite_theme', themeId);
    // Bắn event để MotionBackground cập nhật realtime ngay lập tức
    window.dispatchEvent(new CustomEvent('2lsite-theme-change', { detail: themeId }));
    window.dispatchEvent(new Event('storage'));
    showToast(`Đã áp dụng giao diện: ${themes.find((t) => t.id === themeId)?.name}`, 'success');
  };

  // Xử lý lưu tên người dùng mới
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = usernameInput.trim();
    if (!clean) {
      showToast('Tên người dùng không được để trống', 'error');
      return;
    }
    if (clean.length < 2 || clean.length > 30) {
      showToast('Tên người dùng từ 2 đến 30 ký tự', 'error');
      return;
    }

    setIsSavingName(true);
    try {
      if (updateProfile) {
        const res = await updateProfile({ username: clean });
        if (res?.error) {
          showToast(res.error, 'error');
          return;
        }
      } else if (user?.id) {
        await supabase.from('profiles').update({ username: clean }).eq('id', user.id);
        await supabase.auth.updateUser({ data: { username: clean, display_name: clean } });
      }
      showToast('Cập nhật tên người dùng thành công!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật tên', 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  // Gửi email xác nhận Gmail
  const handleSendVerificationEmail = async () => {
    if (!user?.email || sendingConfirm) return;
    setSendingConfirm(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname + '#/verify-email',
        },
      });
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Đã gửi email xác nhận! Vui lòng kiểm tra hộp thư đến (hoặc mục Spam).', 'success');
      }
    } catch (err: any) {
      showToast('Không thể gửi email xác nhận lúc này.', 'error');
    } finally {
      setSendingConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại Dashboard</span>
      </button>

      {/* Header Profile */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center space-x-4">
          {/* Avatar hiển thị chữ cái đầu của Tên người dùng */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-purple-950/50">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">{displayName}</h1>
              {profile?.role === 'admin' ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40 flex items-center">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Thành viên
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{profile?.email || user?.email}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Gia nhập từ: {profile?.created_at ? formatDate(profile.created_at) : 'Gần đây'}
            </p>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/change-password')}
            className="w-full sm:w-auto"
          >
            <KeyRound className="w-4 h-4 mr-2 text-purple-400" /> Đổi mật khẩu
          </Button>
        </div>
      </div>

      {/* Phần 1: Đổi Tên Hiển Thị (Username) */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-cyan-900/40 text-cyan-400">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Tên người dùng hiển thị</h2>
            <p className="text-xs text-slate-400">
              Tên hiển thị thay cho email trên thanh điều hướng và kho highlight
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveUsername} className="flex flex-col sm:flex-row gap-4 items-end max-w-xl">
          <div className="flex-1 w-full">
            <Input
              label="Tên hiển thị của bạn"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Nhập tên người dùng mới..."
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={isSavingName}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            <Save className="w-4 h-4 mr-2" /> Lưu tên mới
          </Button>
        </form>
      </div>

      {/* Phần 2: Tùy Chỉnh Giao Diện Nền Động (Motion Background) */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-purple-900/40 text-purple-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Tùy chỉnh Motion Background
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin duration-3000" />
            </h2>
            <p className="text-xs text-slate-400">
              Chọn chủ đề hiệu ứng chuyển động yêu thích cho toàn bộ trang web 2Lsite của bạn
            </p>
          </div>
        </div>

        {/* Danh sách chủ đề Background */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`group cursor-pointer rounded-xl p-4 border transition-all duration-300 flex items-center justify-between ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500 shadow-lg shadow-purple-950/40'
                    : 'border-slate-700/80 hover:border-slate-500 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {/* Vòng màu preview */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.colors} flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`} />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{theme.desc}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phần 3: Xác thực Gmail & Bảo mật */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-900/40 text-indigo-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Xác thực Gmail</h2>
            <p className="text-xs text-slate-400">
              Xác thực địa chỉ email để bảo vệ tài khoản và khôi phục khi cần thiết
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{profile?.email || user?.email}</span>
              {isEmailConfirmed ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> Đã xác nhận
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/40">
                  <AlertTriangle className="w-3 h-3" /> Chưa xác nhận
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isEmailConfirmed
                ? 'Gmail của bạn đã được liên kết và xác minh an toàn.'
                : 'Nhấn vào nút bên cạnh để gửi email liên kết xác minh tài khoản của bạn.'}
            </p>
          </div>

          <div>
            {isEmailConfirmed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm font-medium">
                <Check className="w-4 h-4" /> Đã xác thực
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={sendingConfirm}
                onClick={handleSendVerificationEmail}
                className="w-full sm:w-auto"
              >
                <MailCheck className="w-4 h-4 mr-2" />
                Xác nhận Gmail
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
