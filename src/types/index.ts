// ===== Kiểu dữ liệu chính cho GameClips =====

/** Hồ sơ người dùng */
export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_banned: boolean;
  created_at: string;
  avatar_url?: string | null;
}

/** Thông tin video */
export interface Video {
  id: string;
  user_id: string;
  title: string;
  game: string;
  description: string;
  tags: string[];
  storage_path: string;
  thumbnail_path: string | null;
  size: number;
  created_at: string;
  updated_at: string;
}

/** Metadata khi upload video */
export interface VideoMetadata {
  title: string;
  game: string;
  description: string;
  tags: string[];
}

/** Bộ lọc video */
export interface VideoFilters {
  search?: string;
  game?: string;
  sortBy?: 'created_at' | 'title' | 'size';
  sortOrder?: 'asc' | 'desc';
}

/** Mã OTP */
export interface OtpRequest {
  email: string;
  purpose: 'reset_password' | 'change_password' | 'delete_account';
}

/** Thống kê admin */
export interface AdminStats {
  total_users: number;
  total_videos: number;
  total_storage_bytes: number;
}

/** User kèm thống kê (dùng trong admin) */
export interface UserWithStats extends Profile {
  video_count: number;
  total_size: number;
}

/** Phản hồi API chuẩn */
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

/** Toast notification */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/** Cấu hình ứng dụng */
export const APP_CONFIG = {
  MAX_VIDEO_SIZE: parseInt(import.meta.env.VITE_MAX_VIDEO_SIZE_MB || '100') * 1024 * 1024,
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'] as string[],
  ALLOWED_VIDEO_EXTENSIONS: ['.mp4', '.webm', '.mov'] as string[],
  OTP_EXPIRY_MINUTES: 5,
  OTP_MAX_ATTEMPTS: 5,
  OTP_RESEND_COOLDOWN_SECONDS: 60,
  SIGNED_URL_EXPIRY_SECONDS: 3600,
  APP_NAME: '2Lsite',
} as const;
