import { supabase } from '../lib/supabase';
import { handleSupabaseError } from './api';
import type { ApiResponse, Profile } from '../types';
import type { User } from '@supabase/supabase-js';

/**
 * Service xử lý tất cả logic xác thực người dùng
 * Bao gồm: đăng nhập, đăng ký, đăng xuất, quản lý profile, đổi mật khẩu
 */
export const authService = {
  /**
   * Đăng nhập bằng email và mật khẩu
   * Sau khi đăng nhập thành công, kiểm tra xem tài khoản có bị banned không
   */
  async signIn(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User }>> {
    try {
      // Thực hiện đăng nhập qua Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: 'Không thể đăng nhập. Vui lòng thử lại',
        };
      }

      // Kiểm tra tài khoản có bị khóa (banned) không
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // Nếu không tìm thấy profile, vẫn cho đăng nhập
        // Profile có thể chưa được tạo (sẽ được tạo bởi trigger)
        console.warn('Không tìm thấy profile cho user:', data.user.id);
      }

      // Nếu tài khoản bị banned, đăng xuất và báo lỗi
      if (profile?.is_banned) {
        await supabase.auth.signOut();
        return {
          data: null,
          error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên',
        };
      }

      return {
        data: { user: data.user },
        error: null,
      };
    } catch (err) {
      console.error('[Auth] Lỗi đăng nhập:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },
   /**
   * Đăng ký tài khoản mới
   */
  async signUp(
    email: string,
    password: string,
    username?: string
  ): Promise<ApiResponse<{ user: User }>> {
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}#/verify-email`;
      const cleanUsername = username?.trim() || email.split('@')[0];

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: cleanUsername,
            display_name: cleanUsername,
          },
        },
      });

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: 'Không thể tạo tài khoản. Vui lòng thử lại',
        };
      }

      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          username: cleanUsername,
          role: 'user',
          is_banned: false,
        });
      } catch (e) {
        console.warn('Lưu username vào profiles:', e);
      }

      return {
        data: { user: data.user },
        error: null,
      };
    } catch (err) {
      console.error('[Auth] Lỗi đăng ký:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Cập nhật thông tin profile (tên người dùng, avatar_url, etc.)
   */
  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      if (updates.username) {
        await supabase.auth.updateUser({
          data: { username: updates.username, display_name: updates.username },
        });
      }

      return {
        data: data as Profile,
        error: null,
      };
    } catch (err) {
      console.error('[Auth] Lỗi cập nhật profile:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Đăng xuất người dùng hiện tại
   * Xóa session khỏi Supabase Auth
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Lỗi đăng xuất:', error);
      }
    } catch (err) {
      console.error('[Auth] Lỗi đăng xuất:', err);
    }
  },

  /**
   * Lấy profile người dùng từ bảng profiles
   * Profile chứa thông tin bổ sung như role, is_banned, avatar_url
   */
  async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      return {
        data: data as Profile,
        error: null,
      };
    } catch (err) {
      console.error('[Auth] Lỗi lấy profile:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Đổi mật khẩu (sau khi đã xác thực OTP hoặc đang đăng nhập)
   * Sử dụng Supabase Auth updateUser để cập nhật mật khẩu mới
   */
  async changePassword(newPassword: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (err) {
      console.error('[Auth] Lỗi đổi mật khẩu:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Kiểm tra mật khẩu hiện tại có đúng không
   * Thử đăng nhập với email và password, nếu thành công thì mật khẩu đúng
   * Không thực hiện sign out vì user đã đăng nhập sẵn
   */
  async verifyCurrentPassword(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Nếu không có lỗi, mật khẩu đúng
      return !error;
    } catch {
      return false;
    }
  },
};
