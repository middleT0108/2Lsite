import React, { useEffect, useRef, useState } from 'react';

export type BackgroundTheme = 'cyber-purple' | 'neon-blue' | 'matrix-green' | 'sunset-fire' | 'galaxy-dark';

interface MotionBackgroundProps {
  theme?: BackgroundTheme;
}

interface ThemeConfig {
  bg: string;
  orb1: string;
  orb2: string;
  orb3: string;
  grid: string;
  particles: string[];
  line: string;
}

const THEME_CONFIGS: Record<BackgroundTheme, ThemeConfig> = {
  'cyber-purple': {
    bg: '#090514',
    orb1: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(126, 34, 206, 0.2) 50%, transparent 75%)',
    orb2: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(14, 116, 144, 0.18) 50%, transparent 75%)',
    orb3: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
    grid: 'rgba(168, 85, 247, 0.22)',
    particles: ['#a855f7', '#06b6d4', '#e879f9', '#818cf8'],
    line: 'rgba(168, 85, 247,',
  },
  'neon-blue': {
    bg: '#030c1c',
    orb1: 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, rgba(14, 165, 233, 0.22) 50%, transparent 75%)',
    orb2: 'radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 75%)',
    orb3: 'radial-gradient(circle, rgba(96, 165, 250, 0.35) 0%, transparent 70%)',
    grid: 'rgba(6, 182, 212, 0.22)',
    particles: ['#00f0ff', '#38bdf8', '#3b82f6', '#93c5fd'],
    line: 'rgba(6, 182, 212,',
  },
  'matrix-green': {
    bg: '#02140b',
    orb1: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.22) 50%, transparent 75%)',
    orb2: 'radial-gradient(circle, rgba(34, 197, 94, 0.45) 0%, rgba(16, 185, 129, 0.2) 50%, transparent 75%)',
    orb3: 'radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, transparent 70%)',
    grid: 'rgba(16, 185, 129, 0.22)',
    particles: ['#10b981', '#22c55e', '#34d399', '#86efac'],
    line: 'rgba(34, 197, 94,',
  },
  'sunset-fire': {
    bg: '#140507',
    orb1: 'radial-gradient(circle, rgba(244, 63, 94, 0.5) 0%, rgba(225, 29, 72, 0.22) 50%, transparent 75%)',
    orb2: 'radial-gradient(circle, rgba(249, 115, 22, 0.45) 0%, rgba(234, 88, 12, 0.2) 50%, transparent 75%)',
    orb3: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%)',
    grid: 'rgba(244, 63, 94, 0.22)',
    particles: ['#f43f5e', '#fb923c', '#f59e0b', '#fda4af'],
    line: 'rgba(249, 115, 22,',
  },
  'galaxy-dark': {
    bg: '#060612',
    orb1: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(67, 56, 202, 0.18) 50%, transparent 75%)',
    orb2: 'radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(88, 28, 135, 0.15) 50%, transparent 75%)',
    orb3: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
    grid: 'rgba(129, 140, 248, 0.16)',
    particles: ['#818cf8', '#a78bfa', '#c084fc', '#e0e7ff'],
    line: 'rgba(129, 140, 248,',
  },
};

export const MotionBackground: React.FC<MotionBackgroundProps> = ({ theme: propTheme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<BackgroundTheme>(propTheme || 'cyber-purple');

  useEffect(() => {
    if (!propTheme) {
      const savedTheme = (localStorage.getItem('2lsite_theme') as BackgroundTheme) || 'cyber-purple';
      setTheme(savedTheme);

      const handleThemeChange = (e: any) => {
        const nextTheme = e?.detail || (localStorage.getItem('2lsite_theme') as BackgroundTheme) || 'cyber-purple';
        setTheme(nextTheme);
      };

      window.addEventListener('2lsite-theme-change', handleThemeChange);
      window.addEventListener('storage', handleThemeChange);

      return () => {
        window.removeEventListener('2lsite-theme-change', handleThemeChange);
        window.removeEventListener('storage', handleThemeChange);
      };
    } else {
      setTheme(propTheme);
    }
  }, [propTheme]);

  const cfg = THEME_CONFIGS[theme] || THEME_CONFIGS['cyber-purple'];

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

    const particleCount = Math.min(Math.floor((width * height) / 11000), 85);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1.2,
      color: cfg.particles[Math.floor(Math.random() * cfg.particles.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

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
        ctx.shadowBlur = 10;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${cfg.line} ${alpha})`;
            ctx.lineWidth = 1;
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
  }, [theme, cfg]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: cfg.bg }}
    >
      {/* 1. Neon Glowing Orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full animate-pulse duration-[6000ms]"
        style={{ background: cfg.orb1, filter: 'blur(100px)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full animate-pulse duration-[8000ms]"
        style={{ background: cfg.orb2, filter: 'blur(110px)' }}
      />
      <div
        className="absolute top-[35%] right-[20%] w-[500px] h-[500px] rounded-full animate-pulse duration-[5000ms]"
        style={{ background: cfg.orb3, filter: 'blur(90px)' }}
      />

      {/* 2. Cyberpunk Grid Pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `linear-gradient(${cfg.grid} 1px, transparent 1px), linear-gradient(90deg, ${cfg.grid} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* 3. Canvas hạt đom đóm & mạng nhện chuyển động */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 4. Radial Vignette tạo chiều sâu 3D */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(5, 5, 10, 0.7) 95%)',
        }}
      />
    </div>
  );
};

export default MotionBackground;
