import { supabase } from '../lib/supabase';
import { handleSupabaseError } from './api';
import { getFileExtension } from '../lib/utils';
import type { ApiResponse, Video, VideoMetadata, VideoFilters } from '../types';
import { APP_CONFIG } from '../types';

/**
 * Service xử lý tất cả logic liên quan đến video
 * Bao gồm: CRUD video, upload, signed URL, quản lý storage
 */
export const videoService = {
  /**
   * Lấy danh sách video của user với các bộ lọc
   * RLS tự đảm bảo user chỉ thấy video của mình
   */
  async getVideos(
    userId: string,
    filters?: VideoFilters
  ): Promise<ApiResponse<Video[]>> {
    try {
      // Bắt đầu query từ bảng videos
      let query = supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId);

      // Áp dụng bộ lọc tìm kiếm theo title hoặc game
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`title.ilike.${searchTerm},game.ilike.${searchTerm}`);
      }

      // Lọc theo game cụ thể
      if (filters?.game) {
        query = query.eq('game', filters.game);
      }

      // Sắp xếp theo trường và thứ tự được chọn
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      return {
        data: (data as Video[]) || [],
        error: null,
      };
    } catch (err) {
      console.error('[Video] Lỗi lấy danh sách video:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Lấy chi tiết một video theo ID
   */
  async getVideo(videoId: string): Promise<ApiResponse<Video>> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      return {
        data: data as Video,
        error: null,
      };
    } catch (err) {
      console.error('[Video] Lỗi lấy chi tiết video:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Lấy danh sách game duy nhất (không trùng) từ video của user
   * Dùng cho dropdown filter
   */
  async getUniqueGames(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('game')
        .eq('user_id', userId);

      if (error) {
        console.error('[Video] Lỗi lấy danh sách game:', error);
        return [];
      }

      // Lọc lấy các game duy nhất và sắp xếp theo alphabet
      const uniqueGames = [...new Set((data || []).map((v) => v.game))].sort();
      return uniqueGames;
    } catch (err) {
      console.error('[Video] Lỗi lấy danh sách game:', err);
      return [];
    }
  },

  /**
   * Upload video lên Storage và tạo record trong database
   * Quy trình: Upload file → Upload thumbnail → Insert DB record
   * 
   * Storage path format: videos/{userId}/{videoId}/video.{ext}
   * Thumbnail path format: videos/{userId}/{videoId}/thumbnail.jpg
   */
  async uploadVideo(
    userId: string,
    file: File,
    thumbnailBlob: Blob | null,
    metadata: VideoMetadata,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Video>> {
    // Tạo UUID cho video
    const videoId = crypto.randomUUID();
    const fileExt = getFileExtension(file.name);
    const storagePath = `videos/${userId}/${videoId}/video${fileExt}`;
    let thumbnailPath: string | null = null;

    try {
      // Bước 1: Bắt đầu upload - thông báo tiến trình 10%
      onProgress?.(10);

      // Xác định contentType chính xác cho video, ưu tiên định dạng video hợp lệ của Supabase bucket
      let resolvedContentType = file.type;
      if (!resolvedContentType || resolvedContentType === 'application/octet-stream') {
        const lowerExt = fileExt.toLowerCase();
        if (lowerExt === '.webm') {
          resolvedContentType = 'video/webm';
        } else if (lowerExt === '.mov') {
          resolvedContentType = 'video/quicktime';
        } else {
          // Mặc định fallback là video/mp4 nếu file không nhận diện được mime type
          resolvedContentType = 'video/mp4';
        }
      }

      // Bước 2: Upload file video lên Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: resolvedContentType,
        });

      if (uploadError) {
        return {
          data: null,
          error: `Lỗi tải video lên: ${handleSupabaseError(uploadError)}`,
        };
      }

      // Upload video hoàn tất - cập nhật tiến trình 50%
      onProgress?.(50);

      // Bước 3: Upload thumbnail nếu có
      if (thumbnailBlob) {
        thumbnailPath = `videos/${userId}/${videoId}/thumbnail.jpg`;

        const { error: thumbError } = await supabase.storage
          .from('videos')
          .upload(thumbnailPath, thumbnailBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg',
          });

        if (thumbError) {
          // Thumbnail lỗi không critical, chỉ log warning
          console.warn('[Video] Lỗi upload thumbnail:', thumbError);
          thumbnailPath = null;
        }
      }

      // Upload thumbnail hoàn tất - cập nhật tiến trình 75%
      onProgress?.(75);

      // Bước 4: Tạo record trong bảng videos
      const videoRecord = {
        id: videoId,
        user_id: userId,
        title: metadata.title,
        game: metadata.game,
        description: metadata.description,
        tags: metadata.tags,
        storage_path: storagePath,
        thumbnail_path: thumbnailPath,
        size: file.size,
      };

      const { data: insertedVideo, error: insertError } = await supabase
        .from('videos')
        .insert(videoRecord)
        .select()
        .single();

      if (insertError) {
        // Nếu insert DB thất bại, xóa file đã upload để tránh orphan files
        await supabase.storage.from('videos').remove([storagePath]);
        if (thumbnailPath) {
          await supabase.storage.from('videos').remove([thumbnailPath]);
        }

        return {
          data: null,
          error: `Lỗi lưu thông tin video: ${handleSupabaseError(insertError)}`,
        };
      }

      // Hoàn tất - cập nhật tiến trình 100%
      onProgress?.(100);

      return {
        data: insertedVideo as Video,
        error: null,
      };
    } catch (err) {
      console.error('[Video] Lỗi upload video:', err);

      // Cleanup: xóa các file đã upload nếu có lỗi
      try {
        await supabase.storage.from('videos').remove([storagePath]);
        if (thumbnailPath) {
          await supabase.storage.from('videos').remove([thumbnailPath]);
        }
      } catch (cleanupErr) {
        console.error('[Video] Lỗi cleanup sau upload thất bại:', cleanupErr);
      }

      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Cập nhật thông tin metadata của video
   * Chỉ cập nhật các trường được truyền vào
   */
  async updateVideo(
    videoId: string,
    updates: Partial<VideoMetadata>
  ): Promise<ApiResponse<Video>> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', videoId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
        };
      }

      return {
        data: data as Video,
        error: null,
      };
    } catch (err) {
      console.error('[Video] Lỗi cập nhật video:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Xóa video hoàn toàn: file trong storage + record trong database
   * Thứ tự: xóa file storage trước → xóa DB record sau
   */
  async deleteVideo(
    videoId: string,
    storagePath: string,
    thumbnailPath: string | null
  ): Promise<ApiResponse<null>> {
    try {
      // Bước 1: Xóa file video trong storage
      const filesToRemove = [storagePath];
      if (thumbnailPath) {
        filesToRemove.push(thumbnailPath);
      }

      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove(filesToRemove);

      if (storageError) {
        console.warn('[Video] Lỗi xóa file storage:', storageError);
        // Vẫn tiếp tục xóa record DB dù storage lỗi
      }

      // Bước 2: Xóa record trong database
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (dbError) {
        return {
          data: null,
          error: handleSupabaseError(dbError),
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (err) {
      console.error('[Video] Lỗi xóa video:', err);
      return {
        data: null,
        error: handleSupabaseError(err),
      };
    }
  },

  /**
   * Tạo signed URL để xem/phát video
   * URL có thời hạn theo APP_CONFIG.SIGNED_URL_EXPIRY_SECONDS (mặc định 1 giờ)
   */
  async getSignedUrl(storagePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(storagePath, APP_CONFIG.SIGNED_URL_EXPIRY_SECONDS);

      if (error) {
        console.error('[Video] Lỗi tạo signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('[Video] Lỗi tạo signed URL:', err);
      return null;
    }
  },

  /**
   * Tạo signed URL cho thumbnail
   * Dùng cùng thời hạn với video URL
   */
  async getSignedThumbnailUrl(thumbnailPath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(thumbnailPath, APP_CONFIG.SIGNED_URL_EXPIRY_SECONDS);

      if (error) {
        console.error('[Video] Lỗi tạo signed thumbnail URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('[Video] Lỗi tạo signed thumbnail URL:', err);
      return null;
    }
  },
};
