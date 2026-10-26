import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import type { Profile } from '../types';

/**
 * Interface mô tả tất cả giá trị AuthContext cung cấp
 */
interface AuthContextType {
  /** User object từ Supabase Auth (null nếu chưa đăng nhập) */
  user: User | null;
  /** Profile từ bảng profiles (chứa role, is_banned, avatar_url) */
  profile: Profile | null;
  /** Đang tải trạng thái xác thực ban đầu */
  loading: boolean;
  /** Kiểm tra user có phải admin không */
  isAdmin: boolean;
  /** Hàm đăng nhập */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Hàm đăng ký */
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Hàm đăng xuất */
  signOut: () => Promise<void>;
  /** Làm mới profile từ database */
  refreshProfile: () => Promise<void>;
}

// Tạo context với giá trị mặc định undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export context và hook useAuth để các components sử dụng
export { AuthContext };

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Component bọc toàn bộ app để cung cấp trạng thái xác thực
 * 
 * Chức năng:
 * - Lắng nghe thay đổi auth state từ Supabase
 * - Tự động load profile khi user đăng nhập
 * - Cung cấp các hàm signIn, signUp, signOut
 * - Kiểm tra quyền admin
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Kiểm tra role admin từ profile
  const isAdmin = profile?.role === 'admin';

  /**
   * Load profile từ database theo userId
   * Được gọi khi user đăng nhập hoặc khi cần refresh
   */
  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await authService.getProfile(userId);
    if (error) {
      console.error('[AuthContext] Lỗi tải profile:', error);
      setProfile(null);
      return;
    }
    setProfile(data);
  }, []);

  /**
   * Refresh profile - lấy lại profile mới nhất từ database
   * Dùng khi cần cập nhật thông tin profile (ví dụ: sau khi admin thay đổi)
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.id);
  }, [user, loadProfile]);

  /**
   * Đăng nhập bằng email và mật khẩu
   * Kiểm tra tài khoản bị banned trước khi cho phép đăng nhập
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const result = await authService.signIn(email, password);

      if (result.error) {
        return { error: result.error };
      }

      // User và profile sẽ được cập nhật qua onAuthStateChange listener
      return { error: null };
    },
    []
  );

  /**
   * Đăng ký tài khoản mới
   * Sau khi đăng ký, user cần xác nhận email trước khi đăng nhập
   */
  const signUp = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const result = await authService.signUp(email, password);

      if (result.error) {
        return { error: result.error };
      }

      return { error: null };
    },
    []
  );

  /**
   * Đăng xuất - xóa session và reset state
   */
  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  /**
   * Effect: Khởi tạo auth state và lắng nghe thay đổi
   * 
   * 1. Lấy session hiện tại (nếu có)
   * 2. Subscribe vào onAuthStateChange để theo dõi login/logout
   * 3. Cleanup subscription khi component unmount
   */
  useEffect(() => {
    let isMounted = true;

    // Lấy session hiện tại khi app khởi động
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('[AuthContext] Lỗi khởi tạo auth:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Lắng nghe thay đổi auth state (đăng nhập, đăng xuất, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          // User vừa đăng nhập
          setUser(session.user);
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          // User vừa đăng xuất
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token được refresh, cập nhật user object
          setUser(session.user);
        } else if (event === 'USER_UPDATED' && session?.user) {
          // User info được cập nhật (ví dụ: đổi mật khẩu)
          setUser(session.user);
        }
      }
    );

    // Cleanup: hủy subscription và đánh dấu unmounted
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Giá trị cung cấp cho toàn bộ app qua context
  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
