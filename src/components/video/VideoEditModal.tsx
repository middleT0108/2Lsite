import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Video, VideoMetadata } from '../../types';
import { videoEditSchema } from '../../lib/validators';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface VideoEditModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (videoId: string, updates: Partial<VideoMetadata>) => Promise<boolean>;
}

export const VideoEditModal: React.FC<VideoEditModalProps> = ({
  video,
  isOpen,
  onClose,
  onSave,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    title: string;
    game: string;
    description: string;
  }>({
    resolver: zodResolver(videoEditSchema),
    defaultValues: {
      title: '',
      game: '',
      description: '',
    },
  });

  useEffect(() => {
    if (video) {
      reset({
        title: video.title,
        game: video.game,
        description: video.description || '',
      });
      setTags(video.tags || []);
    }
  }, [video, reset]);

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

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data: { title: string; game: string; description: string }) => {
    if (!video) return;
    setIsSubmitting(true);
    try {
      const success = await onSave(video.id, {
        title: data.title,
        game: data.game,
        description: data.description,
        tags,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa thông tin highlight">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Tiêu đề clip *"
          placeholder="VD: Pha xử lý clutch 1v4"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Tên tựa game *"
          placeholder="VD: Valorant, CS2, League of Legends..."
          error={errors.game?.message}
          {...register('game')}
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Mô tả video
          </label>
          <textarea
            rows={3}
            placeholder="Ghi chú lại khoảnh khắc hoặc trận đấu..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Thêm Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Thẻ phân loại (Tối đa 10 thẻ)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDownTag}
              placeholder="Nhập thẻ rồi ấn Thêm hoặc Enter"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 10}
            >
              <Plus className="w-4 h-4 mr-1" /> Thêm
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs bg-slate-800 text-primary-300 border border-primary-500/30 px-2.5 py-1 rounded-full"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="ml-1.5 text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VideoEditModal;
