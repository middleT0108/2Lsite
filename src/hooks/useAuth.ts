import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

/**
 * Interface mô tả giá trị AuthContext trả về
 */
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Custom hook để truy cập AuthContext
 * Phải được sử dụng bên trong AuthProvider
 * 
 * @throws Error nếu sử dụng ngoài AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, profile, isAdmin, signOut } = useAuth();
 *   // ...
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }

  return context;
}
