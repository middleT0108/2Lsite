import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileVideo,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Film,
  Layers,
  Trash2,
  ArrowRight,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import { VideoMetadata, APP_CONFIG } from '../../types';
import { isValidVideoFile, formatFileSize, extractThumbnail } from '../../lib/utils';
import { videoService } from '../../services/video.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';

interface UploadItem {
  id: string;
  file: File;
  title: string;
  game: string;
  description: string;
  thumbnailBlob: Blob | null;
  thumbnailUrl: string | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

interface VideoUploaderProps {
  onUploadSuccess?: () => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [commonGame, setCommonGame] = useState('');
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trích xuất thumbnail an toàn với timeout 4s
  const safeExtractThumbnail = async (file: File): Promise<{ blob: Blob | null; url: string | null }> => {
    try {
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const thumbPromise = extractThumbnail(file).catch(() => null);
      const blob = await Promise.race([thumbPromise, timeoutPromise]);
      if (blob) {
        return { blob, url: URL.createObjectURL(blob) };
      }
    } catch (err) {
      console.warn('Lỗi trích xuất thumbnail:', err);
    }
    return { blob: null, url: null };
  };

  // Thêm danh sách file vào hàng đợi
  const handleAddFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    const newItems: UploadItem[] = [];
    let rejectedCount = 0;

    for (const file of filesArray) {
      const validation = isValidVideoFile(file);
      if (!validation.valid) {
        rejectedCount++;
        continue;
      }

      // Tự động lấy tên file (bỏ đuôi .mp4, .webm) làm title mặc định
      const rawName = file.name || '';
      const lastDot = rawName.lastIndexOf('.');
      const cleanTitle = (lastDot !== -1 ? rawName.substring(0, lastDot) : rawName) || 'Clip Highlight';

      const tempId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

      newItems.push({
        id: tempId,
        file,
        title: cleanTitle,
        game: commonGame || '',
        description: '',
        thumbnailBlob: null,
        thumbnailUrl: null,
        status: 'idle',
        progress: 0,
      });
    }

    if (rejectedCount > 0) {
      showToast(
        `Đã bỏ qua ${rejectedCount} file không hợp lệ hoặc vượt quá ${APP_CONFIG.MAX_VIDEO_SIZE / 1024 / 1024}MB`,
        'error'
      );
    }

    if (newItems.length === 0) return;

    // Cập nhật queue trước để hiển thị ngay trên giao diện
    setQueue((prev) => [...prev, ...newItems]);

    // Trích xuất thumbnail nền cho từng video mới
    for (const item of newItems) {
      safeExtractThumbnail(item.file).then(({ blob, url }) => {
        if (blob && url) {
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, thumbnailBlob: blob, thumbnailUrl: url } : q))
          );
        }
      });
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isUploadingAll) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleAddFiles(e.dataTransfer.files);
      }
    },
    [isUploadingAll, commonGame]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Xóa 1 video khỏi danh sách
  const handleRemoveItem = (id: string) => {
    if (isUploadingAll) return;
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item?.thumbnailUrl) {
        URL.revokeObjectURL(item.thumbnailUrl);
      }
      return prev.filter((q) => q.id !== id);
    });
  };

  // Cập nhật thuộc tính của 1 video trong hàng đợi
  const handleUpdateItem = (id: string, updates: Partial<UploadItem>) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  // Áp dụng tên game chung cho toàn bộ video trong danh sách
  const handleApplyCommonGame = () => {
    if (!commonGame.trim()) {
      showToast('Vui lòng nhập tên game cần áp dụng', 'error');
      return;
    }
    setQueue((prev) => prev.map((q) => ({ ...q, game: commonGame.trim() })));
    showToast(`Đã áp dụng game "${commonGame.trim()}" cho ${queue.length} video`, 'success');
  };

  // Xóa toàn bộ hàng đợi
  const handleClearQueue = () => {
    if (isUploadingAll) return;
    queue.forEach((q) => {
      if (q.thumbnailUrl) URL.revokeObjectURL(q.thumbnailUrl);
    });
    setQueue([]);
  };

  // Thực hiện upload toàn bộ video tuần tự (sequential)
  const handleUploadAll = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để upload video', 'error');
      return;
    }

    const pendingItems = queue.filter((item) => item.status !== 'success');
    if (pendingItems.length === 0) {
      showToast('Không có video nào cần tải lên', 'error');
      return;
    }

    // Kiểm tra tên game bắt buộc
    const missingGame = queue.some((item) => !item.game.trim());
    if (missingGame) {
      showToast('Vui lòng điền tên Game cho tất cả các video trước khi tải lên', 'error');
      return;
    }

    setIsUploadingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'success') continue;

      setCurrentUploadingIndex(i);
      handleUpdateItem(item.id, { status: 'uploading', progress: 10 });

      const metadata: VideoMetadata = {
        title: item.title.trim() || 'Clip Highlight',
        game: item.game.trim(),
        description: item.description.trim(),
        tags: [item.game.trim()].filter(Boolean),
      };

      try {
        const result = await videoService.uploadVideo(
          user.id,
          item.file,
          item.thumbnailBlob,
          metadata,
          (uploadProgress) => {
            handleUpdateItem(item.id, { progress: uploadProgress });
          }
        );

        if (result.error) {
          failCount++;
          handleUpdateItem(item.id, {
            status: 'error',
            errorMessage: result.error,
            progress: 0,
          });
        } else {
          successCount++;
          handleUpdateItem(item.id, {
            status: 'success',
            progress: 100,
          });
        }
      } catch (err: any) {
        failCount++;
        handleUpdateItem(item.id, {
          status: 'error',
          errorMessage: err?.message || 'Lỗi tải lên',
          progress: 0,
        });
      }
    }

    setIsUploadingAll(false);
    setCurrentUploadingIndex(null);

    if (successCount > 0 && failCount === 0) {
      showToast(`Tải lên thành công toàn bộ ${successCount} video highlight!`, 'success');
    } else if (successCount > 0 && failCount > 0) {
      showToast(`Đã tải xong ${successCount} video (${failCount} video lỗi)`, 'warning');
    } else {
      showToast('Tải video thất bại. Vui lòng thử lại', 'error');
    }
  };

  const totalBytes = queue.reduce((acc, q) => acc + q.file.size, 0);
  const successItemsCount = queue.filter((q) => q.status === 'success').length;
  const isAllSuccess = queue.length > 0 && successItemsCount === queue.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Vùng Dropzone Upload File (Hỗ trợ kéo thả nhiều video cùng lúc) */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => !isUploadingAll && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] ${
          isUploadingAll
            ? 'opacity-60 cursor-not-allowed border-slate-700 bg-slate-900/40'
            : 'border-slate-700/80 hover:border-purple-500 hover:bg-purple-950/10 bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={APP_CONFIG.ALLOWED_VIDEO_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleAddFiles(e.target.files);
              e.target.value = '';
            }
          }}
          disabled={isUploadingAll}
        />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-600/30 text-purple-400 flex items-center justify-center mb-4 shadow-lg border border-purple-500/20">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">
          Kéo thả nhiều video vào đây hoặc <span className="text-purple-400 underline">duyệt từ máy tính</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-md">
          Hỗ trợ tải lên nhiều video cùng lúc (MP4, WebM, MOV, MKV - Tối đa {APP_CONFIG.MAX_VIDEO_SIZE / 1024 / 1024}MB/file)
        </p>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-[11px] px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/30 flex items-center gap-1.5">
            <Layers className="w-3 h-3" /> Hỗ trợ Multi-Upload
          </span>
          <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Tự trích xuất Thumbnail
          </span>
        </div>
      </div>

      {/* Danh sách video trong hàng đợi */}
      {queue.length > 0 && (
        <div className="bg-surface-light/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header hàng đợi & Công cụ áp dụng nhanh */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Danh sách tải lên ({queue.length} video)
                <span className="text-xs font-normal text-slate-400">
                  - Tổng dung lượng: {formatFileSize(totalBytes)}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Điền tên game và tiêu đề cho từng clip hoặc áp dụng tên game chung bên dưới
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAll}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Thêm video khác
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearQueue}
                disabled={isUploadingAll}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Xóa tất cả
              </Button>
            </div>
          </div>

          {/* Thanh công cụ áp dụng nhanh Tên Game cho toàn bộ clip */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-medium whitespace-nowrap">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <span>Tên game chung cho tất cả:</span>
            </div>
            <input
              type="text"
              value={commonGame}
              onChange={(e) => setCommonGame(e.target.value)}
              placeholder="Ví dụ: Liên Minh Huyền Thoại, Valorant, FC Online..."
              disabled={isUploadingAll}
              className="flex-1 w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleApplyCommonGame}
              disabled={isUploadingAll || !commonGame.trim()}
              className="w-full sm:w-auto text-xs whitespace-nowrap"
            >
              Áp dụng cho tất cả
            </Button>
          </div>

          {/* Danh sách thẻ video */}
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {queue.map((item, index) => {
              const isCurrent = currentUploadingIndex === index;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.status === 'uploading'
                      ? 'border-purple-500 bg-purple-950/20 shadow-md ring-1 ring-purple-500/50'
                      : item.status === 'success'
                      ? 'border-emerald-500/40 bg-emerald-950/15'
                      : item.status === 'error'
                      ? 'border-red-500/40 bg-red-950/15'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Thumbnail preview */}
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="w-24 h-16 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-6 h-6 text-slate-600" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] px-1 py-0.5 rounded bg-black/70 text-slate-300 font-mono">
                          {formatFileSize(item.file.size)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Tiêu đề video */}
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                          disabled={isUploadingAll || item.status === 'success'}
                          placeholder="Tiêu đề highlight..."
                          className="w-full font-semibold text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                        />
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.file.name}</p>
                      </div>
                    </div>

                    {/* Ô nhập Game & Nút xóa */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="w-40 sm:w-48">
                        <input
                          type="text"
                          value={item.game}
                          onChange={(e) => handleUpdateItem(item.id, { game: e.target.value })}
                          disabled={isUploadingAll || item.status === 'success'}
                          placeholder="Tên game (bắt buộc) *"
                          className={`w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border text-slate-200 placeholder-slate-500 focus:outline-none ${
                            !item.game.trim()
                              ? 'border-amber-500/50 focus:border-amber-500'
                              : 'border-slate-700/80 focus:border-purple-500'
                          }`}
                        />
                      </div>

                      {/* Trạng thái / Nút xóa */}
                      <div className="flex items-center gap-2">
                        {item.status === 'success' && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Đã xong
                          </span>
                        )}

                        {item.status === 'uploading' && (
                          <span className="text-xs text-purple-400 font-mono font-medium animate-pulse">
                            {item.progress}%
                          </span>
                        )}

                        {item.status === 'error' && (
                          <span className="text-xs text-red-400 flex items-center gap-1" title={item.errorMessage}>
                            <AlertCircle className="w-4 h-4" /> Thất bại
                          </span>
                        )}

                        {item.status === 'idle' && !isUploadingAll && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Xóa khỏi danh sách"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thanh tiến trình khi đang upload video này */}
                  {item.status === 'uploading' && (
                    <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Thanh hành động phía dưới */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              {isAllSuccess ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã tải lên hoàn tất {successItemsCount}/{queue.length} video highlight!
                </span>
              ) : isUploadingAll ? (
                <span className="text-purple-400 font-medium animate-pulse">
                  Đang tải video {(currentUploadingIndex ?? 0) + 1} / {queue.length}...
                </span>
              ) : (
                <span>
                  Sẵn sàng tải lên: <strong className="text-white">{queue.length - successItemsCount}</strong> clip
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isAllSuccess ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={onUploadSuccess}
                  className="w-full sm:w-auto"
                >
                  Về Dashboard xem clip <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  loading={isUploadingAll}
                  disabled={isUploadingAll}
                  onClick={handleUploadAll}
                  className="w-full sm:w-auto px-6"
                >
                  <UploadCloud className="w-5 h-5 mr-2" />
                  Bắt đầu tải lên {queue.length > 1 ? `(${queue.length} video)` : ''}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
