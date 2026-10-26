import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Palette,
  Check,
  ArrowLeft,
  Shield,
  Calendar,
  Save,
  MailCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  ExternalLink,
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

  const [localUsername, setLocalUsername] = useState<string | null>(() => {
    return localStorage.getItem('2lsite_username');
  });

  // Trạng thái xác minh Gmail THỰC TẾ
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(() => {
    return Boolean(user?.user_metadata?.gmail_verified);
  });

  const [sendingConfirm, setSendingConfirm] = useState(false);
  const [hasSentLink, setHasSentLink] = useState(false);

  // Tự động nhận diện khi người dùng click vào link trong Gmail mở về web
  useEffect(() => {
    const handleUrlVerification = async () => {
      const hash = window.location.hash;
      if (hash.includes('access_token=') || hash.includes('type=recovery')) {
        try {
          await supabase.auth.updateUser({
            data: { gmail_verified: true, verified_at: new Date().toISOString() },
          });
          setIsEmailConfirmed(true);
          showToast('Xác thực Gmail từ liên kết thành công!', 'success');
        } catch (err) {
          console.warn('Lỗi auto verify link:', err);
        }
      }
    };
    handleUrlVerification();
  }, []);

  // Kiểm tra trạng thái từ Supabase server
  useEffect(() => {
    const checkStatus = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setIsEmailConfirmed(Boolean(data.user.user_metadata?.gmail_verified));
      }
    };
    checkStatus();
  }, [user]);

  const displayName =
    localUsername ||
    profile?.username ||
    (user?.user_metadata?.username as string) ||
    profile?.email?.split('@')[0] ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    const saved = (localStorage.getItem('2lsite_theme') as BackgroundTheme) || 'cyber-purple';
    setCurrentTheme(saved);
  }, []);

  useEffect(() => {
    if (localUsername) {
      setUsernameInput(localUsername);
    } else if (profile?.username) {
      setUsernameInput(profile.username);
    } else if (user?.email) {
      setUsernameInput(user.email.split('@')[0]);
    }
  }, [localUsername, profile?.username, user]);

  const themes: { id: BackgroundTheme; name: string; desc: string; colors: string }[] = [
    { id: 'cyber-purple', name: 'Cyberpunk Purple (Mặc định)', desc: 'Tím Neon huyền ảo kết hợp Cyan', colors: 'from-purple-600 via-indigo-600 to-cyan-500' },
    { id: 'neon-blue', name: 'Electric Neon Blue', desc: 'Xanh dương công nghệ cao & sắc sảo', colors: 'from-cyan-500 via-blue-600 to-sky-400' },
    { id: 'matrix-green', name: 'Matrix Hacker Green', desc: 'Xanh ngọc lục bảo phong cách hacker', colors: 'from-emerald-500 via-teal-600 to-green-400' },
    { id: 'sunset-fire', name: 'Sunset Inferno', desc: 'Cam đỏ rực cháy nhiệt huyết gaming', colors: 'from-rose-600 via-orange-500 to-amber-400' },
    { id: 'galaxy-dark', name: 'Deep Galaxy', desc: 'Huyền bí tối giản như không gian vũ trụ', colors: 'from-indigo-900 via-purple-950 to-slate-900' },
  ];

  const handleSelectTheme = (themeId: BackgroundTheme) => {
    setCurrentTheme(themeId);
    localStorage.setItem('2lsite_theme', themeId);
    window.dispatchEvent(new CustomEvent('2lsite-theme-change', { detail: themeId }));
    showToast(`Đã áp dụng giao diện: ${themes.find((t) => t.id === themeId)?.name}`, 'success');
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = usernameInput.trim();
    if (!clean) return showToast('Tên không được để trống', 'error');

    setIsSavingName(true);
    try {
      setLocalUsername(clean);
      localStorage.setItem('2lsite_username', clean);
      window.dispatchEvent(new CustomEvent('2lsite-username-change', { detail: clean }));

      await supabase.auth.updateUser({ data: { username: clean, display_name: clean } });
      if (user?.id) {
        await supabase.from('profiles').update({ username: clean }).eq('id', user.id);
      }
      if (updateProfile) await updateProfile({ username: clean });

      showToast('Cập nhật tên người dùng thành công!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Lỗi lưu tên', 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  // Gửi link xác thực về Gmail
  const handleSendVerificationEmail = async () => {
    if (!user?.email || sendingConfirm) return;
    setSendingConfirm(true);
    try {
      const redirectUrl = window.location.origin + window.location.pathname + '#/profile';
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setHasSentLink(true);
      showToast('Đã gửi email xác thực! Vui lòng kiểm tra hộp thư của bạn.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi email lúc này. Vui lòng thử lại sau.', 'error');
    } finally {
      setSendingConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
            <p className="text-xs text-slate-400 mt-1">{profile?.email || user?.email}</p>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tham gia: {formatDate(profile?.created_at || user?.created_at || new Date())}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form đổi Tên */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Tên người dùng (Display Name)</h2>
            <p className="text-xs text-slate-400">Tên này sẽ hiển thị trên Header thay cho địa chỉ Gmail</p>
          </div>
        </div>

        <form onSubmit={handleSaveUsername} className="max-w-md space-y-4">
          <Input
            label="Tên hiển thị của bạn"
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Ví dụ: Trung, GamerPro..."
          />
          <Button type="submit" variant="primary" size="sm" loading={isSavingName}>
            <Save className="w-4 h-4 mr-2" />
            Lưu tên mới
          </Button>
        </form>
      </div>

      {/* Themes */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Chủ đề giao diện (Theme Gamers)</h2>
            <p className="text-xs text-slate-400">Chọn tông màu nền động dạng sóng neon hiện đại</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500 shadow-lg shadow-purple-950/30'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className={`h-12 w-full rounded-lg bg-gradient-to-r ${theme.colors} mb-3 shadow-inner opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-end p-2`}>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-slate-950/80 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white">{theme.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{theme.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHUNG XÁC THỰC GMAIL */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Xác thực Gmail</h2>
            <p className="text-xs text-slate-400">Xác thực email để có thể khôi phục tài khoản khi quên mật khẩu</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                : 'Tài khoản chưa xác minh sẽ không thể dùng tính năng Quên mật khẩu.'}
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
              >
                <Send className="w-4 h-4 mr-2" />
                Gửi email xác thực
              </Button>
            )}
          </div>
        </div>

        {/* Hướng dẫn mở Gmail khi vừa bấm gửi */}
        {!isEmailConfirmed && hasSentLink && (
          <div className="p-4 rounded-xl border border-purple-800/50 bg-purple-950/30 text-xs text-purple-200 flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-300">Đã gửi thư xác thực tới Gmail của bạn!</p>
              <p className="text-slate-300 mt-1">
                Vui lòng mở hòm thư Gmail (kiểm tra cả mục Spam/Thư rác) và bấm vào đường link trong thư để kích hoạt tài khoản.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
