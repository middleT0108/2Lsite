import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { getPasswordStrength } from '../../lib/validators';
import { classNames } from '../../lib/utils';

interface PasswordStrengthBarProps {
  /** Mật khẩu cần đánh giá */
  password: string;
}

// Màu sắc tương ứng với từng mức điểm (0-4)
const scoreColors: Record<number, string> = {
  0: 'bg-red-500',
  1: 'bg-orange-500',
  2: 'bg-yellow-500',
  3: 'bg-green-500',
  4: 'bg-emerald-400',
};

// Màu text cho label tương ứng
const labelColors: Record<number, string> = {
  0: 'text-red-400',
  1: 'text-orange-400',
  2: 'text-yellow-400',
  3: 'text-green-400',
  4: 'text-emerald-400',
};

/**
 * Thanh đo độ mạnh mật khẩu
 * Hiển thị 4 thanh màu + label + checklist tiêu chí
 */
const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  // Tính toán độ mạnh mật khẩu
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  // Kiểm tra từng tiêu chí của mật khẩu
  const criteria = useMemo(
    () => [
      { label: 'Ít nhất 8 ký tự', met: password.length >= 8 },
      { label: 'Chứa chữ hoa (A-Z)', met: /[A-Z]/.test(password) },
      { label: 'Chứa chữ thường (a-z)', met: /[a-z]/.test(password) },
      { label: 'Chứa số (0-9)', met: /[0-9]/.test(password) },
      { label: 'Chứa ký tự đặc biệt (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );

  // Không hiển thị nếu chưa nhập mật khẩu
  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Thanh đo độ mạnh - 4 thanh ngang */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={classNames(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                // Tô màu thanh nếu score đủ cao
                index < strength.score
                  ? scoreColors[strength.score - 1] || 'bg-slate-700'
                  : 'bg-slate-700'
              )}
            />
          ))}
        </div>

        {/* Label mô tả độ mạnh */}
        <p
          className={classNames(
            'text-xs font-medium transition-colors duration-200',
            labelColors[strength.score - 1] || 'text-slate-500'
          )}
        >
          {strength.label}
        </p>
      </div>

      {/* Checklist tiêu chí */}
      <ul className="space-y-1">
        {criteria.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-xs"
          >
            {item.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            )}
            <span
              className={classNames(
                'transition-colors duration-200',
                item.met ? 'text-slate-300' : 'text-slate-500'
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthBar;
