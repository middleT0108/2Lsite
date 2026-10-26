import React, { forwardRef } from 'react';
import { classNames } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label hiển thị phía trên input */
  label?: string;
  /** Thông báo lỗi hiển thị phía dưới (text đỏ) */
  error?: string;
  /** Text gợi ý hiển thị phía dưới (text xám) */
  helperText?: string;
}

/**
 * Input component với label và error message
 * Sử dụng forwardRef để tương thích với react-hook-form
 * Dark theme gaming aesthetic
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    // Tạo ID tự động nếu không được truyền vào
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          className={classNames(
            // Base styles - dark theme
            'w-full px-4 py-2.5 rounded-lg',
            'bg-slate-800 text-slate-100 placeholder-slate-500',
            'border transition-all duration-200 ease-out',
            // Focus styles với glow effect
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            // Conditional border color dựa trên error state
            error
              ? 'border-red-500 focus:border-red-400 focus:ring-red-500/30'
              : 'border-slate-600 hover:border-slate-500 focus:border-purple-500 focus:ring-purple-500/20',
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-600',
            className
          )}
          {...props}
        />

        {/* Error message - hiển thị màu đỏ */}
        {error && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text - hiển thị màu xám */}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
