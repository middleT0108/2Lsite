import React, { useEffect, useRef, useState } from 'react';

export type BackgroundTheme = 'cyber-purple' | 'neon-blue' | 'matrix-green' | 'sunset-fire' | 'galaxy-dark';

interface MotionBackgroundProps {
  theme?: BackgroundTheme;
}

export const MotionBackground: React.FC<MotionBackgroundProps> = ({ theme: propTheme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<BackgroundTheme>(propTheme || 'cyber-purple');

  useEffect(() => {
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

  // Hiệu ứng hạt Canvas Motion Particles kết nối mạng lưới đa chiều
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Bảng màu hạt theo Theme
    const getParticleColors = () => {
      switch (theme) {
        case 'neon-blue':
          return {
            particles: ['#06b6d4', '#3b82f6', '#60a5fa'],
            line: 'rgba(6, 182, 212,',
          };
        case 'matrix-green':
          return {
            particles: ['#10b981', '#059669', '#34d399'],
            line: 'rgba(16, 185, 129,',
          };
        case 'sunset-fire':
          return {
            particles: ['#f43f5e', '#f97316', '#fbbf24'],
            line: 'rgba(244, 63, 94,',
          };
        case 'galaxy-dark':
          return {
            particles: ['#818cf8', '#a78bfa', '#c084fc'],
            line: 'rgba(129, 140, 248,',
          };
        case 'cyber-purple':
        default:
          return {
            particles: ['#a855f7', '#06b6d4', '#6366f1'],
            line: 'rgba(168, 85, 247,',
          };
      }
    };

    const themeColors = getParticleColors();

    // Khởi tạo các hạt hạt chuyển động
    const particleCount = Math.min(Math.floor((width * height) / 12000), 75);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      radius: Math.random() * 2 + 1.2,
      color: themeColors.particles[Math.floor(Math.random() * themeColors.particles.length)],
    }));

    // Vòng lặp vẽ chuyển động (60 FPS)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Cập nhật và vẽ từng hạt
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Nối dây tơ phát sáng giữa các hạt gần nhau
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${themeColors.line} ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  // Cấu hình màu sắc đốm sáng Neon Orbs theo Theme
  const getOrbGradients = () => {
    switch (theme) {
      case 'neon-blue':
        return {
          glow1: 'from-cyan-600/35 to-blue-700/25',
          glow2: 'from-sky-500/30 to-indigo-800/25',
          glow3: 'from-blue-500/25 to-teal-700/20',
          grid: 'rgba(6, 182, 212, 0.22)',
        };
      case 'matrix-green':
        return {
          glow1: 'from-emerald-600/35 to-teal-800/25',
          glow2: 'from-green-500/30 to-emerald-900/25',
          glow3: 'from-teal-500/25 to-emerald-700/20',
          grid: 'rgba(16, 185, 129, 0.22)',
        };
      case 'sunset-fire':
        return {
          glow1: 'from-rose-600/35 to-red-800/25',
          glow2: 'from-orange-500/30 to-amber-700/25',
          glow3: 'from-red-500/25 to-orange-800/20',
          grid: 'rgba(244, 63, 94, 0.22)',
        };
      case 'galaxy-dark':
        return {
          glow1: 'from-indigo-600/30 to-purple-900/25',
          glow2: 'from-purple-800/25 to-slate-900/40',
          glow3: 'from-blue-700/20 to-indigo-950/30',
          grid: 'rgba(129, 140, 248, 0.18)',
        };
      case 'cyber-purple':
      default:
        return {
          glow1: 'from-purple-600/40 to-indigo-800/30',
          glow2: 'from-cyan-500/35 to-blue-700/25',
          glow3: 'from-fuchsia-600/30 to-purple-900/25',
          grid: 'rgba(168, 85, 247, 0.25)',
        };
    }
  };

  const orbs = getOrbGradients();

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#070b14]">
      {/* 1. Các vầng Neon Orbs khổng lồ thở chậm chuyển động lơ lửng */}
      <div
        className={`absolute top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br ${orbs.glow1} blur-[140px] animate-pulse duration-[7000ms]`}
      />
      <div
        className={`absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br ${orbs.glow2} blur-[150px] animate-pulse duration-[9000ms]`}
      />
      <div
        className={`absolute top-[35%] right-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-br ${orbs.glow3} blur-[130px] animate-pulse duration-[6000ms]`}
      />

      {/* 2. Cyberpunk Glowing Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(${orbs.grid} 1.2px, transparent 1.2px), linear-gradient(90deg, ${orbs.grid} 1.2px, transparent 1.2px)`,
          backgroundSize: '54px 54px',
        }}
      />

      {/* 3. Canvas hạt đom đóm & mạng nhện chuyển động không ngừng (Active Particles) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 4. Radial Vignette tạo chiều sâu 3D */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(7, 11, 20, 0.85) 90%)',
        }}
      />
    </div>
  );
};

export default MotionBackground;
