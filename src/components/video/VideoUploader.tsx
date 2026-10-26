import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, FileVideo, X, Plus, AlertCircle } from 'lucide-react';
import { VideoMetadata, APP_CONFIG } from '../../types';
import { videoMetadataSchema } from '../../lib/validators';
import { isValidVideoFile, formatFileSize, extractThumbnail } from '../../lib/utils';
import { useUpload } from '../../hooks/useUpload';
import { useAuth } from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface VideoUploaderProps {
  onUploadSuccess?: () => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const { uploading, progress, upload, error: uploadError } = useUpload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [_thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{
    title: string;
    game: string;
    description: string;
  }>({
    resolver: zodResolver(videoMetadataSchema),
    defaultValues: {
      title: '',
      game: '',
      description: '',
    },
  });

  // Xử lý chọn file
  const handleFileChange = async (file: File) => {
    setFileError(null);
    const validation = isValidVideoFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Tập tin không hợp lệ');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Tự động gợi ý tiêu đề dựa theo tên file nếu chưa nhập
    const rawName = file?.name || '';
    const lastDot = rawName.lastIndexOf('.');
    const cleanName = (lastDot !== -1 ? rawName.substring(0, lastDot) : rawName) || 'Clip Highlight';
    setValue('title', cleanName);

    // Trích xuất thumbnail từ video tự động
    try {
      const blob = await extractThumbnail(file);
      setThumbnailBlob(blob);
      setPreviewThumbnail(URL.createObjectURL(blob));
    } catch (err) {
      console.warn('Không thể tạo tự động thumbnail:', err);
      setThumbnailBlob(null);
      setPreviewThumbnail(null);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [uploading]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (idxToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== idxToRemove));
  };

  const onSubmit = async (data: { title: string; game: string; description: string }) => {
    if (!user) return;
    if (!selectedFile) {
      setFileError('Vui lòng chọn 1 file video highlight để tải lên');
      return;
    }

    const metadata: VideoMetadata = {
      title: data.title,
      game: data.game,
      description: data.description,
      tags,
    };

    const result = await upload(selectedFile, metadata);
    if (result) {
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
  };

  return (
    <div className="bg-surface-light border border-slate-700/80 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vùng Dropzone Upload Video */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            File video highlight (Tối đa {APP_CONFIG.MAX_VIDEO_SIZE / 1024 / 1024}MB) *
          </label>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[180px] ${
              selectedFile
                ? 'border-primary-500/60 bg-primary-950/10'
                : 'border-slate-700 hover:border-primary-500 hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={APP_CONFIG.ALLOWED_VIDEO_TYPES.join(',')}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              disabled={uploading}
            />

            {selectedFile ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                {previewThumbnail ? (
                  <img
                    src={previewThumbnail}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg border border-slate-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-900/30 text-primary-400 flex items-center justify-center">
                    <FileVideo className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-200 text-sm break-all">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Dung lượng: {formatFileSize(selectedFile.size)}
                  </p>
                  <p className="text-xs text-primary-400 mt-2 font-medium">
                    Nhấn để đổi video khác
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 mb-3 shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  Kéo thả video vào đây hoặc <span className="text-primary-400">Chọn file</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Định dạng hỗ trợ: MP4, WebM, MOV (Dung lượng tối đa 100MB)
                </p>
              </>
            )}
          </div>

          {fileError && (
            <div className="flex items-center text-xs text-red-400 mt-2">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        {/* Thanh tiến trình Upload */}
        {uploading && (
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
              <span>Đang tải lên highlight & tạo thumbnail...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-600 to-accent h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form thông tin video */}
        <div className="space-y-4">
          <Input
            label="Tiêu đề clip *"
            placeholder="VD: Pha ace round 24"
            error={errors.title?.message}
            disabled={uploading}
            {...register('title')}
          />

          <Input
            label="Tựa game *"
            placeholder="VD: Valorant, Liên Minh Huyền Thoại, CS2..."
            error={errors.game?.message}
            disabled={uploading}
            {...register('game')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú thêm về khoảnh khắc này..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled={uploading}
              {...register('description')}
            />
            {errors.description?.message && (
              <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Thẻ phân loại
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                placeholder="Nhập thẻ rồi bấm Thêm"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                disabled={uploading}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
                disabled={uploading || !tagInput.trim() || tags.length >= 10}
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs bg-slate-800 text-primary-300 border border-primary-500/30 px-2.5 py-1 rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      disabled={uploading}
                      className="ml-1.5 text-slate-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {uploadError && (
          <p className="text-xs text-red-400 text-center">{uploadError}</p>
        )}

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={uploading}
            disabled={!selectedFile || uploading}
            className="w-full sm:w-auto"
          >
            Bắt đầu tải lên
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VideoUploader;
