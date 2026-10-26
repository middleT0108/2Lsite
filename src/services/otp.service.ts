import { callEdgeFunction } from './api';
import type { ApiResponse } from '../types';

/**
 * Service xử lý xác thực OTP (One-Time Password)
 * Tất cả logic OTP được xử lý bên Edge Functions
 * Client chỉ gọi Edge Function và nhận kết quả
 */
export const otpService = {
  /**
   * Gửi mã OTP qua email
   * Edge Function sẽ tạo mã OTP, lưu vào DB và gửi email
   * 
   * @param email - Email nhận mã OTP
   * @param purpose - Mục đích: 'reset_password' | 'change_password' | 'delete_account'
   */
  async sendOtp(
    email: string,
    purpose: string
  ): Promise<ApiResponse<{ message: string }>> {
    return callEdgeFunction<{ message: string }>('send-otp', {
      email,
      purpose,
    });
  },

  /**
   * Xác thực mã OTP người dùng nhập
   * Edge Function sẽ kiểm tra mã OTP có hợp lệ không (đúng mã, chưa hết hạn, chưa vượt số lần thử)
   * 
   * @param email - Email đã nhận mã OTP
   * @param code - Mã OTP 6 số người dùng nhập
   * @param purpose - Mục đích của OTP (phải khớp với lúc gửi)
   */
  async verifyOtp(
    email: string,
    code: string,
    purpose: string
  ): Promise<ApiResponse<{ valid: boolean }>> {
    return callEdgeFunction<{ valid: boolean }>('verify-otp', {
      email,
      code,
      purpose,
    });
  },

  /**
   * Đặt lại mật khẩu bằng OTP (dành cho trường hợp quên mật khẩu)
   * Edge Function sẽ xác thực OTP và cập nhật mật khẩu mới qua Supabase Admin API
   * 
   * @param email - Email của tài khoản cần đặt lại mật khẩu
   * @param code - Mã OTP đã được gửi
   * @param newPassword - Mật khẩu mới
   */
  async resetPasswordWithOtp(
    email: string,
    code: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    return callEdgeFunction<null>('reset-password', {
      email,
      code,
      newPassword,
    });
  },
};
