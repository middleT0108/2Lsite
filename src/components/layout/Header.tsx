import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  LayoutDashboard,
  Upload,
  Shield,
  User,
  KeyRound,
  LogOut,
  Menu,
  X,
  ChevronDown,
  MailCheck,
  Video,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { classNames } from '../../lib/utils';

/**
 * Header/Navbar component
 * - Logo 2Lsite bên trái
 * - Navigation links: Dashboard, Upload (khi đã đăng nhập)
 * - Dropdown phần mềm quay highlight (Outplayed, Medal.tv, Insights)
 * - Admin link (khi isAdmin)
 * - Tên người dùng hiển thị (thay vì Gmail) kèm avatar
 * - User menu dropdown & Responsive mobile menu
 */
const Header: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Kiểm tra email đã xác nhận chưa từ user object của Supabase
  const isEmailConfirmed = Boolean(user?.email_confirmed_at);
  const [sendingConfirm, setSendingConfirm] = useState(false);

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
        showToast('Đã gửi email xác nhận! Vui lòng kiểm tra hộp thư của bạn.', 'success');
      }
    } catch (err: any) {
      showToast('Không thể gửi email xác nhận lúc này.', 'error');
    } finally {
      setSendingConfirm(false);
    }
  };

  // State cho dropdown user menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // State cho mobile hamburger menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ref để đóng dropdown khi click bên ngoài
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target as Node)
      ) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  // Tên người dùng hiển thị: Ưu tiên username -> user_metadata -> tên trước dấu @ của email
  const displayName =
    profile?.username ||
    (user?.user_metadata?.username as string) ||
    (user?.user_metadata?.display_name as string) ||
    profile?.email?.split('@')[0] ||
    user?.email?.split('@')[0] ||
    'User';

  // Navigation links cấu hình
  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: !!user,
    },
    {
      to: '/upload',
      label: 'Upload',
      icon: Upload,
      show: !!user,
    },
    {
      to: '/admin',
      label: 'Admin',
      icon: Shield,
      show: isAdmin,
    },
  ].filter((link) => link.show);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* === Logo bên trái === */}
          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 group"
          >
            <Gamepad2 className="w-7 h-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              2Lsite
            </span>
          </Link>

          {/* === Navigation links - Desktop === */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={classNames(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-sm font-medium text-slate-300',
                    'hover:text-white hover:bg-slate-800',
                    'transition-colors duration-150'
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* === Dropdown: Phần mềm quay highlight === */}
            <div ref={toolsMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className={classNames(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg',
                  'text-sm font-medium text-slate-300',
                  'hover:text-white hover:bg-slate-800',
                  'transition-colors duration-150',
                  isToolsMenuOpen && 'bg-slate-800 text-purple-400'
                )}
              >
                <Video className="w-4 h-4 text-purple-400" />
                <span>Phần mềm quay highlight</span>
                <ChevronDown
                  className={classNames(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    isToolsMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {isToolsMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Phần mềm khuyên dùng
                  </div>

                  {/* Outplayed */}
                  <a
                    href="https://outplayed.tv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsToolsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-purple-950/40 hover:text-white text-slate-300 transition-colors group mt-1"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-purple-300">
                        Outplayed
                      </p>
                      <p className="text-xs text-slate-400">Tự động bắt khoảnh khắc Kill/Death</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  </a>

                  {/* Medal.tv */}
                  <a
                    href="https://medal.tv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsToolsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-cyan-950/40 hover:text-white text-slate-300 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-300">
                        Medal.tv
                      </p>
                      <p className="text-xs text-slate-400">Clip 2 phút phím tắt, không giật lag</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  </a>

                  {/* Insights Capture */}
                  <a
                    href="https://insights.gg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsToolsMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-950/40 hover:text-white text-slate-300 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-300">
                        Insights Capture
                      </p>
                      <p className="text-xs text-slate-400">Phân tích highlight & review trận đấu</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* === Phần bên phải: User menu hoặc nút login === */}
          <div className="flex items-center gap-3">
            {user ? (
              /* User menu dropdown */
              <div ref={userMenuRef} className="relative">
                {/* Trigger button hiển thị tên người dùng */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={classNames(
                    'hidden md:flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-sm text-slate-300 hover:text-white hover:bg-slate-800',
                    'transition-colors duration-150',
                    isUserMenuOpen && 'bg-slate-800 text-white'
                  )}
                >
                  {/* Avatar chữ cái đầu của Tên người dùng */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[150px] truncate font-medium">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={classNames(
                      'w-4 h-4 transition-transform duration-200',
                      isUserMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div
                    className={classNames(
                      'absolute right-0 top-full mt-2 w-64',
                      'bg-slate-800 border border-slate-700 rounded-xl',
                      'shadow-xl shadow-black/30',
                      'py-1',
                      'animate-in fade-in slide-in-from-top-2 duration-150'
                    )}
                  >
                    {/* Tên & Email hiển thị */}
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-semibold text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {profile?.email || user.email}
                      </p>
                      <p className="text-[11px] text-purple-400 font-medium mt-1">
                        {isAdmin ? 'Quản trị viên' : 'Thành viên'}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {/* Nút gửi email xác nhận nếu chưa xác nhận */}
                      {!isEmailConfirmed && (
                        <button
                          onClick={handleSendVerificationEmail}
                          disabled={sendingConfirm}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                        >
                          <MailCheck className="w-4 h-4" />
                          {sendingConfirm ? 'Đang gửi mail...' : 'Xác nhận Gmail'}
                        </button>
                      )}

                      {/* Menu Hồ sơ cá nhân */}
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-400" />
                        Hồ sơ & Giao diện
                      </Link>

                      <Link
                        to="/change-password"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-slate-400" />
                        Đổi mật khẩu
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Nút đăng nhập khi chưa login */
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Đăng nhập
              </Link>
            )}

            {/* === Hamburger menu button - Mobile === */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* === Mobile Menu === */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {/* Navigation links */}
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <IconComponent className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Menu phần mềm quay trên mobile */}
            <div className="border-t border-slate-700/50 my-2 pt-2">
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Phần mềm quay highlight
              </p>
              <a
                href="https://outplayed.tv/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <span>Outplayed</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
              <a
                href="https://medal.tv/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <span>Medal.tv</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
              <a
                href="https://insights.gg/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <span>Insights Capture</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>

            {/* User section trên mobile */}
            {user ? (
              <>
                <div className="border-t border-slate-700/50 my-2 pt-2">
                  {/* Tên người dùng & Email trên mobile */}
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {profile?.email || user.email}
                    </p>
                  </div>
                  {/* Đổi mật khẩu */}
                  <Link
                    to="/change-password"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    Đổi mật khẩu
                  </Link>
                  {/* Đăng xuất */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
