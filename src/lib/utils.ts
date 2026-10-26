import { APP_CONFIG } from '../types';

// ===== Utility Functions cho GameClips =====

/**
 * Format bytes sang đơn vị dễ đọc (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format ISO date string sang định dạng tiếng Việt
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format thời gian tương đối: "2 phút trước", "3 giờ trước", v.v.
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 5) return 'Vừa xong';
  if (diffSeconds < 60) return `${diffSeconds} giây trước`;
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  return `${diffYears} năm trước`;
}

/**
 * Tạo unique ID đơn giản (dùng cho toast, temp ID, v.v.)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Xóa HTML tags để phòng chống XSS
 */
export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Lấy phần mở rộng file (bao gồm dấu chấm)
 */
export function getFileExtension(filename?: string): string {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot).toLowerCase();
}

/**
 * Kiểm tra file video có hợp lệ không
 * Kiểm tra: MIME type, extension, kích thước
 */
export function isValidVideoFile(file: File): { valid: boolean; error?: string } {
  // Kiểm tra MIME type
  if (!APP_CONFIG.ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Định dạng không hỗ trợ. Chỉ chấp nhận: ${APP_CONFIG.ALLOWED_VIDEO_EXTENSIONS.join(', ')}`,
    };
  }

  // Kiểm tra extension
  const ext = getFileExtension(file.name);
  if (!APP_CONFIG.ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Phần mở rộng file không hợp lệ. Chỉ chấp nhận: ${APP_CONFIG.ALLOWED_VIDEO_EXTENSIONS.join(', ')}`,
    };
  }

  // Kiểm tra kích thước
  if (file.size > APP_CONFIG.MAX_VIDEO_SIZE) {
    const maxSizeMB = APP_CONFIG.MAX_VIDEO_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`,
    };
  }

  // Kiểm tra file rỗng
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File rỗng, vui lòng chọn file khác',
    };
  }

  return { valid: true };
}

/**
 * Trích xuất thumbnail từ video file
 * Seek đến 2 giây hoặc 25% thời lượng video (tùy cái nào nhỏ hơn)
 */
export function extractThumbnail(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Không thể tạo canvas context'));
      return;
    }

    // Tạo URL tạm cho video
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    // Khi metadata sẵn sàng, seek đến vị trí mong muốn
    video.addEventListener('loadedmetadata', () => {
      const seekTime = Math.min(2, video.duration * 0.25);
      video.currentTime = seekTime;
    });

    // Khi frame đã seek sẵn sàng, chụp ảnh
    video.addEventListener('seeked', () => {
      // Đặt kích thước canvas theo tỷ lệ video, tối đa 640px chiều rộng
      const maxWidth = 640;
      const scale = Math.min(1, maxWidth / video.videoWidth);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;

      // Vẽ frame video lên canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Chuyển canvas thành blob JPEG chất lượng 80%
      canvas.toBlob(
        (blob) => {
          // Giải phóng URL tạm
          URL.revokeObjectURL(videoUrl);

          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Không thể tạo thumbnail'));
          }
        },
        'image/jpeg',
        0.8,
      );
    });

    // Xử lý lỗi
    video.addEventListener('error', () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Không thể đọc video để tạo thumbnail'));
    });

    // Bắt đầu load video
    video.load();
  });
}

/**
 * Kết hợp CSS class names (tương tự clsx/classnames)
 * Lọc bỏ các giá trị falsy
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
