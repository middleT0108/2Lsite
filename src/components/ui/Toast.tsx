import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { classNames } from '../../lib/utils';
import type { ToastType } from '../../types';

interface ToastProps {
  /** Nội dung thông báo */
  message: string;
  /** Loại toast: success, error, info, warning */
  type: ToastType;
  /** Callback khi đóng toast */
  onClose: () => void;
}

// Cấu hình styles cho từng loại toast
const toastConfig: Record<
  ToastType,
  {
    icon: React.FC<{ className?: string }>;
    bgClass: string;
    borderClass: string;
    iconClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-emerald-900/80',
    borderClass: 'border-emerald-500/40',
    iconClass: 'text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-red-900/80',
    borderClass: 'border-red-500/40',
    iconClass: 'text-red-400',
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-900/80',
    borderClass: 'border-blue-500/40',
    iconClass: 'text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-900/80',
    borderClass: 'border-amber-500/40',
    iconClass: 'text-amber-400',
  },
};

/**
 * Toast notification component
 * Hiển thị thông báo với icon, message và nút đóng
 * Có animation slide-in từ bên phải
 */
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = toastConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={classNames(
        // Layout
        'flex items-start gap-3 p-4 rounded-lg',
        'min-w-[320px] max-w-md',
        // Styling
        config.bgClass,
        'border',
        config.borderClass,
        'backdrop-blur-sm',
        'shadow-xl shadow-black/20',
        // Animation slide-in
        'animate-in slide-in-from-right-full duration-300',
        'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full'
      )}
      role="alert"
    >
      {/* Icon */}
      <IconComponent className={classNames('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass)} />

      {/* Message */}
      <p className="flex-1 text-sm text-slate-200 leading-relaxed">{message}</p>

      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-0.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors duration-150"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
