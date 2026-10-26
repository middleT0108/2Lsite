import React from 'react';
import { Loader2 } from 'lucide-react';
import { classNames } from '../../lib/utils';

// === Định nghĩa các variants và sizes cho Button ===

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kiểu giao diện của nút */
  variant?: ButtonVariant;
  /** Kích thước nút */
  size?: ButtonSize;
  /** Trạng thái loading - hiển thị spinner và disable */
  loading?: boolean;
  /** Nội dung bên trong nút */
  children: React.ReactNode;
}

// Style classes cho từng variant
const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-purple-600 to-indigo-600',
    'hover:from-purple-500 hover:to-indigo-500',
    'hover:shadow-lg hover:shadow-purple-500/25',
    'text-white',
    'border border-purple-500/20',
    'active:from-purple-700 active:to-indigo-700',
  ].join(' '),
  secondary: [
    'bg-slate-700',
    'hover:bg-slate-600',
    'hover:shadow-lg hover:shadow-slate-500/10',
    'text-slate-200',
    'border border-slate-600',
    'active:bg-slate-800',
  ].join(' '),
  danger: [
    'bg-gradient-to-r from-red-600 to-rose-600',
    'hover:from-red-500 hover:to-rose-500',
    'hover:shadow-lg hover:shadow-red-500/25',
    'text-white',
    'border border-red-500/20',
    'active:from-red-700 active:to-rose-700',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'hover:bg-slate-700/50',
    'text-slate-300',
    'hover:text-white',
    'border border-transparent',
    'active:bg-slate-700',
  ].join(' '),
};

// Style classes cho từng size
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3 text-base gap-2.5',
};

// Kích thước spinner tương ứng với size nút
const spinnerSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/**
 * Button component đa năng với gaming aesthetic
 * Hỗ trợ nhiều variants, sizes, và trạng thái loading
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={classNames(
        // Base styles
        'inline-flex items-center justify-center',
        'font-semibold rounded-lg',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
        // Variant styles
        variantClasses[variant],
        // Size styles
        sizeClasses[size],
        // Disabled state: giảm opacity và cursor not-allowed
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Custom className
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Spinner khi loading */}
      {loading && (
        <Loader2 className={classNames(spinnerSizes[size], 'animate-spin')} />
      )}
      {children}
    </button>
  );
};

export default Button;
