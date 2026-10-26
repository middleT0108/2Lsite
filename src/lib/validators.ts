import { z } from 'zod';

// ===== Validation Schemas cho GameClips =====

// Regex kiểm tra độ mạnh mật khẩu
const hasUpperCase = /[A-Z]/;
const hasLowerCase = /[a-z]/;
const hasDigit = /\d/;
const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

/** Schema đăng nhập */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/** Schema đăng ký - đơn giản hóa mật khẩu chỉ cần từ 6 ký tự */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z
      .string()
      .min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/** Schema metadata video */
export const videoMetadataSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(100, 'Tiêu đề tối đa 100 ký tự'),
  game: z
    .string()
    .min(1, 'Tên game không được để trống')
    .max(50, 'Tên game tối đa 50 ký tự'),
  description: z
    .string()
    .max(500, 'Mô tả tối đa 500 ký tự')
    .default(''),
  tags: z
    .array(z.string().max(30, 'Mỗi tag tối đa 30 ký tự'))
    .max(10, 'Tối đa 10 tags')
    .default([]),
});

export type VideoMetadataFormData = z.infer<typeof videoMetadataSchema>;

/** Schema chỉnh sửa video */
export const videoEditSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(100, 'Tiêu đề tối đa 100 ký tự'),
  game: z
    .string()
    .min(1, 'Tên game không được để trống')
    .max(50, 'Tên game tối đa 50 ký tự'),
  description: z
    .string()
    .max(500, 'Mô tả tối đa 500 ký tự')
    .default(''),
  tags: z
    .array(z.string().max(30, 'Mỗi tag tối đa 30 ký tự'))
    .max(10, 'Tối đa 10 tags')
    .default([]),
});

export type VideoEditFormData = z.infer<typeof videoEditSchema>;

/** Schema yêu cầu gửi OTP quên mật khẩu */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/** Schema đổi mật khẩu */
export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .refine((val) => hasUpperCase.test(val), 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .refine((val) => hasLowerCase.test(val), 'Mật khẩu phải có ít nhất 1 chữ thường')
      .refine((val) => hasDigit.test(val), 'Mật khẩu phải có ít nhất 1 chữ số')
      .refine((val) => hasSpecialChar.test(val), 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
    confirmNewPassword: z
      .string()
      .min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/** Schema reset mật khẩu */
export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ'),
    code: z
      .string()
      .length(6, 'Mã OTP phải có 6 chữ số')
      .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .refine((val) => hasUpperCase.test(val), 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .refine((val) => hasLowerCase.test(val), 'Mật khẩu phải có ít nhất 1 chữ thường')
      .refine((val) => hasDigit.test(val), 'Mật khẩu phải có ít nhất 1 chữ số')
      .refine((val) => hasSpecialChar.test(val), 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
    confirmNewPassword: z
      .string()
      .min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ===== Hàm đánh giá độ mạnh mật khẩu =====

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

/**
 * Đánh giá độ mạnh mật khẩu từ 0-4
 * Dựa trên: độ dài, chữ hoa, chữ thường, số, ký tự đặc biệt
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: 'Rất yếu', color: 'text-red-500' };
  }

  let rawScore = 0;

  // Kiểm tra từng tiêu chí
  if (password.length >= 8) rawScore++;
  if (hasUpperCase.test(password)) rawScore++;
  if (hasLowerCase.test(password)) rawScore++;
  if (hasDigit.test(password)) rawScore++;
  if (hasSpecialChar.test(password)) rawScore++;
  if (password.length >= 12) rawScore++;

  // Quy đổi rawScore (0-6) thành score (0-4)
  let score: number;
  if (rawScore <= 1) {
    score = 0;
  } else if (rawScore === 2) {
    score = 1;
  } else if (rawScore === 3) {
    score = 2;
  } else if (rawScore === 4 || rawScore === 5) {
    score = 3;
  } else {
    score = 4;
  }

  // Map score sang label và màu
  const strengthMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Rất yếu', color: 'text-red-500' },
    1: { label: 'Yếu', color: 'text-orange-500' },
    2: { label: 'Trung bình', color: 'text-yellow-500' },
    3: { label: 'Mạnh', color: 'text-green-500' },
    4: { label: 'Rất mạnh', color: 'text-emerald-500' },
  };

  return { score, ...strengthMap[score] };
}
