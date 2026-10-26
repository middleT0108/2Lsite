import { callEdgeFunction } from './api';
import type { ApiResponse, AdminStats, UserWithStats, Profile, Video } from '../types';

/**
 * Service xử lý các chức năng quản trị (admin)
 * Tất cả logic admin được thực thi bên Edge Functions với service_role key
 * để bypass RLS và có quyền truy cập đầy đủ
 */
export const adminService = {
  /**
   * Lấy thống kê tổng quan hệ thống
   * Bao gồm: tổng số users, tổng số videos, tổng dung lượng storage
   */
  async getStats(): Promise<ApiResponse<AdminStats>> {
    return callEdgeFunction<AdminStats>('admin', {
      action: 'get_stats',
    });
  },

  /**
   * Lấy danh sách users với thống kê (số video, dung lượng)
   * Hỗ trợ phân trang
   * 
   * @param page - Trang hiện tại (bắt đầu từ 1)
   * @param limit - Số lượng users mỗi trang
   */
  async getUsers(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{ users: UserWithStats[]; total: number }>> {
    return callEdgeFunction<{ users: UserWithStats[]; total: number }>('admin', {
      action: 'get_users',
      page,
      limit,
    });
  },

  /**
   * Lấy chi tiết một user và danh sách video của user đó
   * Dùng cho trang quản lý user detail
   * 
   * @param userId - ID của user cần xem chi tiết
   */
  async getUserDetail(
    userId: string
  ): Promise<ApiResponse<{ profile: Profile; videos: Video[] }>> {
    return callEdgeFunction<{ profile: Profile; videos: Video[] }>('admin', {
      action: 'get_user_detail',
      userId,
    });
  },

  /**
   * Khóa hoặc mở khóa tài khoản người dùng
   * 
   * @param userId - ID của user cần thay đổi trạng thái
   * @param isBanned - true = khóa, false = mở khóa
   */
  async toggleBanUser(
    userId: string,
    isBanned: boolean
  ): Promise<ApiResponse<null>> {
    return callEdgeFunction<null>('admin', {
      action: 'toggle_ban',
      userId,
      isBanned,
    });
  },

  /**
   * Xóa video của user (quyền admin)
   * Edge Function sẽ xóa file storage + record DB
   * 
   * @param videoId - ID video cần xóa
   * @param storagePath - Đường dẫn file video trong storage
   * @param thumbnailPath - Đường dẫn thumbnail (có thể null)
   */
  async deleteUserVideo(
    videoId: string,
    storagePath: string,
    thumbnailPath: string | null
  ): Promise<ApiResponse<null>> {
    return callEdgeFunction<null>('admin', {
      action: 'delete_video',
      videoId,
      storagePath,
      thumbnailPath,
    });
  },
};
