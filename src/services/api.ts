import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types';

/**
 * Chuyển đổi lỗi Supabase thành message tiếng Việt dễ hiểu cho người dùng
 */
export function handleSupabaseError(error: unknown): string {
  if (!error) return 'Đã xảy ra lỗi không xác định';

  // Nếu error là object có thuộc tính message
  const err = error as Record<string, unknown>;
  const message = (err.message as string) || (err.error_description as string) || '';
  const status = (err.status as number) || 0;

  // Xử lý các lỗi auth phổ biến
  if (message.includes('Invalid login credentials')) {
    return 'Email hoặc mật khẩu không chính xác';
  }
  if (message.includes('Email not confirmed')) {
    return 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư';
  }
  if (message.includes('User already registered')) {
    return 'Email này đã được đăng ký';
  }
  if (message.includes('Password should be at least')) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  if (message.includes('Email rate limit exceeded')) {
    return 'Gửi email quá nhiều. Vui lòng thử lại sau';
  }
  if (message.includes('Too many requests')) {
    return 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
  }
  if (message.includes('JWT expired') || message.includes('token is expired')) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
  }
  if (message.includes('refresh_token_not_found')) {
    return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại';
  }
  if (message.includes('new row violates row-level security')) {
    return 'Bạn không có quyền thực hiện thao tác này';
  }

  // Xử lý theo HTTP status code
  if (status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
  }
  if (status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này';
  }
  if (status === 404) {
    return 'Không tìm thấy dữ liệu yêu cầu';
  }
  if (status === 409) {
    return 'Dữ liệu đã tồn tại hoặc xung đột';
  }
  if (status === 413) {
    return 'File quá lớn. Vui lòng chọn file nhỏ hơn';
  }
  if (status === 429) {
    return 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
  }
  if (status >= 500) {
    return 'Lỗi máy chủ. Vui lòng thử lại sau';
  }

  // Nếu có message gốc thì trả về, không thì trả mặc định
  if (message) {
    return message;
  }

  // Xử lý trường hợp error là string
  if (typeof error === 'string') {
    return error;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại';
}

/**
 * Gọi Supabase Edge Function với xử lý lỗi đầy đủ
 * @param functionName - Tên Edge Function cần gọi
 * @param body - Body gửi lên Edge Function
 * @returns ApiResponse chứa data hoặc error message
 */
export async function callEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    });

    // Nếu Supabase trả về lỗi
    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
      };
    }

    // Nếu Edge Function trả về lỗi trong response body
    if (data && typeof data === 'object' && 'error' in data && data.error) {
      return {
        data: null,
        error: data.error as string,
      };
    }

    return {
      data: data as T,
      error: null,
    };
  } catch (err) {
    console.error(`[Edge Function] Lỗi khi gọi ${functionName}:`, err);
    return {
      data: null,
      error: handleSupabaseError(err),
    };
  }
}
