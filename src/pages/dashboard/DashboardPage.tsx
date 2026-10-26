import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, HardDrive, RefreshCw } from 'lucide-react';
import { Video, VideoMetadata } from '../../types';
import { formatFileSize } from '../../lib/utils';
import { useVideos } from '../../hooks/useVideos';
import { useToast } from '../../contexts/ToastContext';
import VideoCard from '../../components/video/VideoCard';
import VideoFilters from '../../components/video/VideoFilters';
import VideoEditModal from '../../components/video/VideoEditModal';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    videos,
    loading,
    error,
    filters,
    games,
    setFilters,
    deleteVideo,
    updateVideo,
    refresh,
  } = useVideos();

  // State cho Edit Modal
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // State cho Delete Confirmation Modal
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tính tổng dung lượng các clip đã tải
  const totalStorage = videos.reduce((acc, v) => acc + (v.size || 0), 0);

  const handleEditSave = async (videoId: string, updates: Partial<VideoMetadata>) => {
    const success = await updateVideo(videoId, updates);
    if (success) {
      showToast('Cập nhật thông tin video thành công!', 'success');
    }
    return success;
  };

  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    setIsDeleting(true);
    try {
      const success = await deleteVideo(
        deletingVideo.id,
        deletingVideo.storage_path,
        deletingVideo.thumbnail_path
      );
      if (success) {
        showToast('Đã xóa highlight thành công', 'success');
        setDeletingVideo(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Thống kê cá nhân */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-light border border-slate-700/80 p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Kho Highlight Của Tôi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý và lưu trữ tất cả những khoảnh khắc gaming đỉnh cao
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Badge thống kê */}
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs">
            <Film className="w-4 h-4 text-primary-400" />
            <span className="text-slate-300">
              Tổng số: <strong className="text-white">{videos.length}</strong> clip
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs">
            <HardDrive className="w-4 h-4 text-accent" />
            <span className="text-slate-300">
              Dung lượng: <strong className="text-white">{formatFileSize(totalStorage)}</strong>
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={refresh}
            title="Tải lại danh sách"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/upload')}
            className="shadow-lg shadow-primary-950/50"
          >
            <Upload className="w-4 h-4 mr-2" /> Tải video lên
          </Button>
        </div>
      </div>

      {/* Thanh bộ lọc & Tìm kiếm */}
      <VideoFilters games={games} filters={filters} onFilterChange={setFilters} />

      {/* Lỗi nếu có */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Đang tải danh sách video của bạn..." />
        </div>
      ) : videos.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 px-4 bg-surface-light/40 border border-dashed border-slate-800 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 mx-auto mb-4">
            <Film className="w-8 h-8 opacity-75" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">
            {filters.search || filters.game
              ? 'Không tìm thấy video phù hợp với bộ lọc'
              : 'Bạn chưa có clip highlight nào'}
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            {filters.search || filters.game
              ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc lọc theo tựa game khác'
              : 'Hãy tải lên pha xử lý thần sầu đầu tiên để lưu giữ khoảnh khắc'}
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/upload')}
          >
            <Upload className="w-4 h-4 mr-2" /> Tải clip ngay
          </Button>
        </div>
      ) : (
        /* Grid danh sách video */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onEdit={(v) => setEditingVideo(v)}
              onDelete={(v) => setDeletingVideo(v)}
            />
          ))}
        </div>
      )}

      {/* Modal Chỉnh sửa Video */}
      <VideoEditModal
        video={editingVideo}
        isOpen={Boolean(editingVideo)}
        onClose={() => setEditingVideo(null)}
        onSave={handleEditSave}
      />

      {/* Modal Xác nhận Xóa Video */}
      <Modal
        isOpen={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        title="Xác nhận xóa highlight"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Bạn có chắc chắn muốn xóa video{' '}
            <strong className="text-white">"{deletingVideo?.title}"</strong> không?
            Hành động này sẽ xóa vĩnh viễn tệp video và hình thu nhỏ khỏi hệ thống và không thể khôi phục.
          </p>
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingVideo(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
