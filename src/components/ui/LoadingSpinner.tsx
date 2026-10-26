import React from 'react';
import { classNames } from '../../lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  /** Kích thước spinner */
  size?: SpinnerSize;
  /** Hiển thị giữa màn hình (full screen overlay) */
  fullScreen?: boolean;
  /** Text hiển thị bên dưới spinner */
  text?: string;
}

// Kích thước của spinner circle
const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-16 h-16 border-4',
};

// Kích thước text tương ứng
const textSizeClasses: Record<SpinnerSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Loading spinner với purple gaming theme
 * Có thể hiển thị fullscreen hoặc inline
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  text,
}) => {
  // Nội dung spinner
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Vòng tròn xoay - purple gradient */}
      <div
        className={classNames(
          'rounded-full animate-spin',
          'border-slate-700 border-t-purple-500',
          sizeClasses[size]
        )}
      />
      {/* Text mô tả (nếu có) */}
      {text && (
        <p className={classNames('text-slate-400 animate-pulse', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  // Nếu fullScreen → hiển thị giữa màn hình với overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  // Inline spinner
  return <div className="flex items-center justify-center py-8">{spinnerContent}</div>;
};

export default LoadingSpinner;
