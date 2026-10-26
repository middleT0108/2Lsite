import React, { useEffect, useState } from 'react';

export type BackgroundTheme = 'cyber-purple' | 'neon-blue' | 'matrix-green' | 'sunset-fire' | 'galaxy-dark';

interface MotionBackgroundProps {
  theme?: BackgroundTheme;
}

export const MotionBackground: React.FC<MotionBackgroundProps> = ({ theme: propTheme }) => {
  const [theme, setTheme] = useState<BackgroundTheme>(propTheme || 'cyber-purple');

  useEffect(() => {
    // Đọc theme người dùng đã chọn từ localStorage nếu không truyền prop
    if (!propTheme) {
      const savedTheme = (localStorage.getItem('2lsite_theme') as BackgroundTheme) || 'cyber-purple';
      setTheme(savedTheme);

      const handleStorageChange = () => {
        const updated = (localStorage.getItem('2lsite_theme') as BackgroundTheme) || 'cyber-purple';
        setTheme(updated);
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } else {
      setTheme(propTheme);
    }
  }, [propTheme]);

  // Cấu hình màu sắc theo từng Theme
  const getThemeColors = () => {
    switch (theme) {
      case 'neon-blue':
        return {
          blob1: 'bg-cyan-600/30',
          blob2: 'bg-blue-600/25',
          blob3: 'bg-sky-500/20',
          gridColor: 'rgba(6, 182, 212, 0.25)',
        };
      case 'matrix-green':
        return {
          blob1: 'bg-emerald-600/30',
          blob2: 'bg-teal-600/25',
          blob3: 'bg-green-500/20',
          gridColor: 'rgba(16, 185, 129, 0.25)',
        };
      case 'sunset-fire':
        return {
          blob1: 'bg-rose-600/30',
          blob2: 'bg-orange-600/25',
          blob3: 'bg-amber-500/20',
          gridColor: 'rgba(244, 63, 94, 0.25)',
        };
      case 'galaxy-dark':
        return {
          blob1: 'bg-indigo-700/20',
          blob2: 'bg-slate-800/30',
          blob3: 'bg-purple-900/25',
          gridColor: 'rgba(99, 102, 241, 0.2)',
        };
      case 'cyber-purple':
      default:
        return {
          blob1: 'bg-purple-600/30',
          blob2: 'bg-indigo-600/25',
          blob3: 'bg-cyan-500/20',
          gridColor: 'rgba(139, 92, 246, 0.25)',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-950">
      {/* Dynamic Animated Motion Orbs (Chuyển động lơ lửng mượt mà) */}
      <div
        className={`absolute top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full blur-[120px] animate-pulse duration-[8000ms] ${colors.blob1}`}
      />
      <div
        className={`absolute bottom-[-15%] right-[-5%] w-[650px] h-[650px] rounded-full blur-[140px] animate-pulse duration-[10000ms] ${colors.blob2}`}
      />
      <div
        className={`absolute top-[40%] right-[25%] w-[450px] h-[450px] rounded-full blur-[130px] animate-pulse duration-[6000ms] ${colors.blob3}`}
      />

      {/* Cyberpunk Animated Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `linear-gradient(${colors.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${colors.gridColor} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial Vignette Shadow */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
    </div>
  );
};

export default MotionBackground;
