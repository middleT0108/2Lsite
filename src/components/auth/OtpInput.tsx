import React, { useRef, useState, useCallback, useEffect } from 'react';
import { classNames } from '../../lib/utils';

interface OtpInputProps {
  /** Số lượng ô input (mặc định 6) */
  length?: number;
  /** Callback khi nhập đủ mã OTP */
  onComplete: (otp: string) => void;
  /** Vô hiệu hóa input */
  disabled?: boolean;
}

/**
 * OTP Input component - 6 ô riêng biệt
 * Auto focus ô tiếp theo, hỗ trợ paste, backspace quay lại
 * Gaming aesthetic với purple focus border
 */
const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  disabled = false,
}) => {
  // Mảng giá trị cho từng ô input
  const [values, setValues] = useState<string[]>(new Array(length).fill(''));
  // Refs cho từng ô input để điều khiển focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(length).fill(null));

  // Gọi onComplete khi nhập đủ mã
  useEffect(() => {
    const otp = values.join('');
    if (otp.length === length && values.every((v) => v !== '')) {
      onComplete(otp);
    }
  }, [values, length, onComplete]);

  // Xử lý khi nhập giá trị vào ô
  const handleChange = useCallback(
    (index: number, value: string) => {
      // Chỉ cho phép số
      const digit = value.replace(/[^0-9]/g, '');
      if (digit.length > 1) return; // Chỉ lấy 1 ký tự

      const newValues = [...values];
      newValues[index] = digit;
      setValues(newValues);

      // Auto focus sang ô tiếp theo nếu đã nhập
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [values, length]
  );

  // Xử lý phím Backspace - quay lại ô trước
  const handleKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace') {
        if (values[index] === '' && index > 0) {
          // Nếu ô hiện tại rỗng → xóa ô trước và focus về
          const newValues = [...values];
          newValues[index - 1] = '';
          setValues(newValues);
          inputRefs.current[index - 1]?.focus();
        } else {
          // Xóa giá trị ô hiện tại
          const newValues = [...values];
          newValues[index] = '';
          setValues(newValues);
        }
      }
    },
    [values]
  );

  // Xử lý paste - hỗ trợ paste nhiều số cùng lúc
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pastedData = event.clipboardData.getData('text').replace(/[^0-9]/g, '');

      if (pastedData.length === 0) return;

      const newValues = [...values];
      // Điền từng số vào các ô
      for (let i = 0; i < Math.min(pastedData.length, length); i++) {
        newValues[i] = pastedData[i];
      }
      setValues(newValues);

      // Focus vào ô cuối cùng đã điền hoặc ô tiếp theo
      const focusIndex = Math.min(pastedData.length, length) - 1;
      if (focusIndex < length - 1) {
        inputRefs.current[focusIndex + 1]?.focus();
      } else {
        inputRefs.current[focusIndex]?.focus();
      }
    },
    [values, length]
  );

  // Focus vào ô khi click
  const handleFocus = useCallback((index: number) => {
    inputRefs.current[index]?.select();
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          className={classNames(
            // Layout
            'w-11 h-14 sm:w-14 sm:h-16',
            'text-center text-xl sm:text-2xl font-bold',
            // Dark theme styling
            'bg-slate-800 text-white',
            'border-2 rounded-lg',
            'transition-all duration-200',
            // Focus styles - purple glow
            'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30',
            'focus:shadow-lg focus:shadow-purple-500/20',
            // Default border
            value ? 'border-purple-500/50' : 'border-slate-600',
            // Hover
            'hover:border-slate-500',
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          autoComplete="one-time-code"
          aria-label={`Mã OTP ô ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
