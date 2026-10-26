import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, HardDrive, Tag, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { Video, VideoMetadata } from '../../types';
import { formatDate, formatFileSize } from '../../lib/utils';
import { videoService } from '../../services/video.service';
import { useToast } from '../../contexts/ToastContext';
import VideoPlayer from '../../components/video/VideoPlayer';
import VideoEditModal from '../../components/video/VideoEditModal';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [video, setVideo] = useState<Video | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [posterSrc, setPosterSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tải chi tiết video và signed URLs
  useEffect(() => {
    let isMounted = true;
    const fetchVideoData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const res = await videoService.getVideo(id);
      if (!isMounted) return;

      if (res.error || !res.data) {
        setError(res.error || 'Không tìm thấy video này hoặc bạn không có quyền xem');
        setLoading(false);
        return;
      }

      const v = res.data;
      setVideo(v);

      // Lấy Signed URL xem video
      const vUrl = await videoService.getSignedUrl(v.storage_path);
      if (isMounted) setVideoSrc(vUrl);

      // Lấy Signed URL thumbnail nếu có
      if (v.thumbnail_path) {
        const pUrl = await videoService.getSignedThumbnailUrl(v.thumbnail_path);
        if (isMounted) setPosterSrc(pUrl);
      }

      if (isMounted) setLoading(false);
    };

    fetchVideoData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleEditSave = async (_videoId: string, updates: Partial<VideoMetadata>) => {
    if (!video) return false;
    const res = await videoService.updateVideo(video.id, updates);
    if (res.error || !res.data) {
      showToast(res.error || 'Cập nhật thất bại', 'error');
      return false;
    }
    setVideo(res.data);
    showToast('Đã lưu thông tin video thành công', 'success');
    return true;
  };

  const handleDelete = async () => {
    if (!video) return;
    setIsDeleting(true);
    try {
      const res = await videoService.deleteVideo(
        video.id,
        video.storage_path,
        video.thumbnail_path
      );
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Đã xóa clip thành công', 'success');
        navigate('/dashboard');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Đang tải video & tạo liên kết an toàn..." />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Không thể phát video</h2>
        <p className="text-sm text-slate-400">{error}</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Về trang Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh sách
        </Button>
      </div>

      {/* Video Player */}
      {videoSrc ? (
        <VideoPlayer
          src={videoSrc}
          poster={posterSrc}
          title={video.title}
          downloadFilename={`${video.title.replace(/\s+/g, '_')}.mp4`}
        />
      ) : (
        <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
          Không thể tạo liên kết phát video bảo mật.
        </div>
      )}

      {/* Thông tin chi tiết Video */}
      <div className="bg-surface-light border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="inline-block px-3 py-1 text-xs font-semibold rounded-md bg-primary-950/80 text-primary-300 border border-primary-500/30 mb-2.5">
              {video.game}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {video.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="w-4 h-4 mr-1.5" /> Sửa thông tin
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Xóa video
            </Button>
          </div>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 text-xs text-slate-400 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            <div>
              <p className="text-slate-500">Ngày đăng tải</p>
              <p className="text-slate-200 font-medium">{formatDate(video.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-accent" />
            <div>
              <p className="text-slate-500">Dung lượng video</p>
              <p className="text-slate-200 font-medium">{formatFileSize(video.size)}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {video.description && (
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Mô tả chi tiết
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {video.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Thẻ phân loại
            </h4>
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs bg-slate-800 text-primary-300 border border-slate-700 px-3 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1 text-primary-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <VideoEditModal
        video={video}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditSave}
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xác nhận xóa highlight"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Bạn có chắc chắn muốn xóa video <strong className="text-white">"{video.title}"</strong> không? 
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleDelete}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoDetailPage;
