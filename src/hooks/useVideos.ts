import { useState, useEffect, useCallback } from 'react';
import { videoService } from '../services/video.service';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';
import type { Video, VideoFilters, VideoMetadata } from '../types';

/**
 * Hook quản lý danh sách video của user hiện tại
 * 
 * Chức năng:
 * - Fetch danh sách video với bộ lọc (search, game, sort)
 * - Xóa video (storage + DB)
 * - Cập nhật thông tin video
 * - Tự động fetch khi filters thay đổi
 * - Lấy danh sách game duy nhất cho dropdown filter
 */
export function useVideos() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // State quản lý danh sách video
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State bộ lọc
  const [filters, setFilters] = useState<VideoFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Danh sách game duy nhất (cho dropdown filter)
  const [games, setGames] = useState<string[]>([]);

  /**
   * Fetch danh sách video từ database
   * Áp dụng các filters hiện tại
   */
  const fetchVideos = useCallback(async () => {
    if (!user) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await videoService.getVideos(user.id, filters);

    if (result.error) {
      setError(result.error);
      setVideos([]);
    } else {
      setVideos(result.data || []);
    }

    setLoading(false);
  }, [user, filters]);

  /**
   * Fetch danh sách game duy nhất
   */
  const fetchGames = useCallback(async () => {
    if (!user) {
      setGames([]);
      return;
    }

    const uniqueGames = await videoService.getUniqueGames(user.id);
    setGames(uniqueGames);
  }, [user]);

  /**
   * Xóa video - xóa file trong storage và record trong DB
   * Sau khi xóa thành công, refresh danh sách video
   */
  const deleteVideo = useCallback(
    async (videoId: string, storagePath: string, thumbnailPath: string | null) => {
      const result = await videoService.deleteVideo(videoId, storagePath, thumbnailPath);

      if (result.error) {
        showToast(result.error, 'error');
        return false;
      }

      showToast('Đã xóa video thành công', 'success');

      // Cập nhật danh sách video (loại bỏ video vừa xóa)
      setVideos((prev) => prev.filter((v) => v.id !== videoId));

      // Refresh danh sách game (có thể game đã bị xóa hết video)
      await fetchGames();

      return true;
    },
    [showToast, fetchGames]
  );

  /**
   * Cập nhật thông tin video (title, game, description, tags)
   * Sau khi cập nhật thành công, refresh danh sách video
   */
  const updateVideo = useCallback(
    async (videoId: string, updates: Partial<VideoMetadata>) => {
      const result = await videoService.updateVideo(videoId, updates);

      if (result.error) {
        showToast(result.error, 'error');
        return false;
      }

      showToast('Đã cập nhật video thành công', 'success');

      // Cập nhật video trong danh sách local (không cần fetch lại toàn bộ)
      if (result.data) {
        setVideos((prev) =>
          prev.map((v) => (v.id === videoId ? result.data! : v))
        );
      }

      // Refresh danh sách game (game name có thể đã thay đổi)
      await fetchGames();

      return true;
    },
    [showToast, fetchGames]
  );

  /**
   * Hàm refresh - fetch lại toàn bộ dữ liệu
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchVideos(), fetchGames()]);
  }, [fetchVideos, fetchGames]);

  // Effect: Tự động fetch videos khi user hoặc filters thay đổi
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Effect: Fetch danh sách game khi user thay đổi
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    /** Danh sách video */
    videos,
    /** Đang tải */
    loading,
    /** Lỗi nếu có */
    error,
    /** Bộ lọc hiện tại */
    filters,
    /** Danh sách game duy nhất */
    games,
    /** Cập nhật bộ lọc */
    setFilters,
    /** Xóa video */
    deleteVideo,
    /** Cập nhật thông tin video */
    updateVideo,
    /** Refresh toàn bộ dữ liệu */
    refresh,
  };
}
