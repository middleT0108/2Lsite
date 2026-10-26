import { useState, useCallback } from 'react';
import { videoService } from '../services/video.service';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';
import { isValidVideoFile, extractThumbnail } from '../lib/utils';
import { APP_CONFIG } from '../types';
import type { Video, VideoMetadata } from '../types';

/**
 * Hook quản lý upload video
 * 
 * Chức năng:
 * - Validate file trước khi upload (type, size)
 * - Tự động extract thumbnail từ video
 * - Upload file lên Supabase Storage
 * - Theo dõi tiến trình upload
 * - Xử lý lỗi với toast notification
 */
export function useUpload() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // State quản lý trạng thái upload
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload video với đầy đủ quy trình:
   * 1. Validate file (type + size)
   * 2. Extract thumbnail từ video
   * 3. Upload lên Storage + tạo record DB
   * 
   * @param file - File video cần upload
   * @param metadata - Thông tin video (title, game, description, tags)
   * @returns Video object nếu thành công, null nếu thất bại
   */
  const upload = useCallback(
    async (file: File, metadata: VideoMetadata): Promise<Video | null> => {
      if (!user) {
        showToast('Vui lòng đăng nhập để upload video', 'error');
        return null;
      }

      // Reset state
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Bước 1: Validate file
        if (!isValidVideoFile(file)) {
          const allowedExts = APP_CONFIG.ALLOWED_VIDEO_EXTENSIONS.join(', ');
          const errorMsg = `File không hợp lệ. Chỉ chấp nhận: ${allowedExts}`;
          setError(errorMsg);
          showToast(errorMsg, 'error');
          setUploading(false);
          return null;
        }

        // Kiểm tra kích thước file
        if (file.size > APP_CONFIG.MAX_VIDEO_SIZE) {
          const maxSizeMB = Math.round(APP_CONFIG.MAX_VIDEO_SIZE / (1024 * 1024));
          const errorMsg = `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`;
          setError(errorMsg);
          showToast(errorMsg, 'error');
          setUploading(false);
          return null;
        }

        // Bước 2: Extract thumbnail từ video
        setProgress(5);
        let thumbnailBlob: Blob | null = null;

        try {
          thumbnailBlob = await extractThumbnail(file);
        } catch (thumbErr) {
          // Không thể extract thumbnail - không phải lỗi critical
          console.warn('[Upload] Không thể tạo thumbnail:', thumbErr);
          thumbnailBlob = null;
        }

        // Bước 3: Upload video lên Storage + tạo record DB
        const result = await videoService.uploadVideo(
          user.id,
          file,
          thumbnailBlob,
          metadata,
          (uploadProgress) => {
            setProgress(uploadProgress);
          }
        );

        if (result.error) {
          setError(result.error);
          showToast(result.error, 'error');
          setUploading(false);
          return null;
        }

        // Upload thành công
        showToast('Upload video thành công!', 'success');
        setProgress(100);
        setUploading(false);

        return result.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định khi upload';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        setUploading(false);
        return null;
      }
    },
    [user, showToast]
  );

  return {
    /** Đang upload */
    uploading,
    /** Tiến trình upload (0-100) */
    progress,
    /** Lỗi nếu có */
    error,
    /** Hàm upload video */
    upload,
  };
}
