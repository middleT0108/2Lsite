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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { classNames } from '../../lib/utils';

/**
 * Header/Navbar component
 * - Logo GameClips bên trái
 * - Navigation links: Dashboard, Upload (khi đã đăng nhập)
 * - Admin link (khi isAdmin)
 * - User menu dropdown bên phải
 * - Responsive: hamburger menu trên mobile
 * - Sticky top, backdrop blur
 */
const Header: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // State cho dropdown user menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // State cho mobile hamburger menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ref để đóng dropdown khi click bên ngoài
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
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
          </nav>

          {/* === Phần bên phải: User menu hoặc nút login === */}
          <div className="flex items-center gap-3">
            {user ? (
              /* User menu dropdown */
              <div ref={userMenuRef} className="relative">
                {/* Trigger button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={classNames(
                    'hidden md:flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-sm text-slate-300 hover:text-white hover:bg-slate-800',
                    'transition-colors duration-150',
                    isUserMenuOpen && 'bg-slate-800 text-white'
                  )}
                >
                  {/* Avatar placeholder */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="max-w-[150px] truncate">
                    {profile?.email || user.email}
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
                    {/* Email hiển thị */}
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-medium text-white truncate">
                        {profile?.email || user.email}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAdmin ? 'Quản trị viên' : 'Người dùng'}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/change-password"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
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

            {/* User section trên mobile */}
            {user ? (
              <>
                <div className="border-t border-slate-700/50 my-2 pt-2">
                  {/* Email */}
                  <div className="px-3 py-2">
                    <p className="text-sm text-slate-400 truncate">
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
