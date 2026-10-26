import { useState, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import { useToast } from '../contexts/ToastContext';
import type { AdminStats, UserWithStats } from '../types';

/**
 * Hook cho các chức năng quản trị (admin)
 * 
 * Chức năng:
 * - Lấy thống kê tổng quan hệ thống
 * - Quản lý danh sách users (phân trang)
 * - Khóa/mở khóa tài khoản user
 * - Xóa video của user
 */
export function useAdmin() {
  const { showToast } = useToast();

  // State quản lý dữ liệu admin
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy thống kê tổng quan hệ thống
   * Bao gồm: tổng users, tổng videos, tổng dung lượng
   */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await adminService.getStats();

    if (result.error) {
      setError(result.error);
      showToast(result.error, 'error');
    } else if (result.data) {
      setStats(result.data);
    }

    setLoading(false);
  }, [showToast]);

  /**
   * Lấy danh sách users với thống kê
   * Hỗ trợ phân trang
   * 
   * @param page - Trang hiện tại (bắt đầu từ 1)
   * @param limit - Số lượng users mỗi trang
   */
  const fetchUsers = useCallback(
    async (page: number = 1, limit: number = 20) => {
      setLoading(true);
      setError(null);

      const result = await adminService.getUsers(page, limit);

      if (result.error) {
        setError(result.error);
        showToast(result.error, 'error');
      } else if (result.data) {
        setUsers(result.data.users);
        setTotalUsers(result.data.total);
      }

      setLoading(false);
    },
    [showToast]
  );

  /**
   * Khóa hoặc mở khóa tài khoản user
   * Sau khi thành công, cập nhật state local
   * 
   * @param userId - ID user cần thay đổi trạng thái
   * @param isBanned - true = khóa, false = mở khóa
   */
  const toggleBan = useCallback(
    async (userId: string, isBanned: boolean) => {
      const result = await adminService.toggleBanUser(userId, isBanned);

      if (result.error) {
        showToast(result.error, 'error');
        return false;
      }

      // Cập nhật trạng thái ban trong danh sách users local
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: isBanned } : u
        )
      );

      const action = isBanned ? 'khóa' : 'mở khóa';
      showToast(`Đã ${action} tài khoản thành công`, 'success');

      return true;
    },
    [showToast]
  );

  /**
   * Xóa video của user (quyền admin)
   * Edge Function xử lý xóa storage + DB
   * 
   * @param videoId - ID video cần xóa
   * @param storagePath - Đường dẫn file trong storage
   * @param thumbnailPath - Đường dẫn thumbnail (có thể null)
   */
  const deleteVideo = useCallback(
    async (
      videoId: string,
      storagePath: string,
      thumbnailPath: string | null
    ) => {
      const result = await adminService.deleteUserVideo(
        videoId,
        storagePath,
        thumbnailPath
      );

      if (result.error) {
        showToast(result.error, 'error');
        return false;
      }

      showToast('Đã xóa video thành công', 'success');
      return true;
    },
    [showToast]
  );

  return {
    /** Thống kê tổng quan */
    stats,
    /** Danh sách users */
    users,
    /** Tổng số users (cho phân trang) */
    totalUsers,
    /** Đang tải */
    loading,
    /** Lỗi nếu có */
    error,
    /** Lấy thống kê */
    fetchStats,
    /** Lấy danh sách users */
    fetchUsers,
    /** Khóa/mở khóa user */
    toggleBan,
    /** Xóa video (admin) */
    deleteVideo,
  };
}
