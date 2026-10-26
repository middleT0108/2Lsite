import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Palette, Check, ArrowLeft, Shield, Calendar, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { formatDate } from '../lib/utils';
import { BackgroundTheme } from '../components/layout/MotionBackground';
import Button from '../components/ui/Button';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>('cyber-purple');

  useEffect(() => {
    const saved = (localStorage.getItem('2lsite_theme') as BackgroundTheme) || 'cyber-purple';
    setCurrentTheme(saved);
  }, []);

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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-purple-950/50">
            {profile?.email ? profile.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">{profile?.email || user?.email}</h1>
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

      {/* Phần 1: Tùy Chỉnh Giao Diện Nền Động (Motion Background) */}
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

      {/* Phần 2: Bảo mật & Tài khoản */}
      <div className="bg-surface-light/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-900/40 text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bảo mật tài khoản</h2>
            <p className="text-xs text-slate-400">Quản lý mật khẩu và các thiết lập đăng nhập cá nhân</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl gap-4">
          <div>
            <p className="text-sm font-medium text-slate-200">Mật khẩu đăng nhập</p>
            <p className="text-xs text-slate-400 mt-0.5">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản tốt nhất</p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/change-password')}
          >
            Đổi mật khẩu ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
