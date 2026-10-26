import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, HardDrive, Shield, ShieldAlert, Trash2, Calendar, Eye } from 'lucide-react';
import { Profile, Video } from '../../types';
import { formatDate, formatFileSize } from '../../lib/utils';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await adminService.getUserDetail(id);
    if (res.error || !res.data) {
      setError(res.error || 'Không tìm thấy thông tin tài khoản này');
    } else {
      setProfile(res.data.profile);
      setVideos(res.data.videos || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleConfirmDeleteVideo = async () => {
    if (!deletingVideo) return;
    setIsDeleting(true);
    try {
      const res = await adminService.deleteUserVideo(
        deletingVideo.id,
        deletingVideo.storage_path,
        deletingVideo.thumbnail_path
      );
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Admin đã xóa video thành công', 'success');
        setVideos(videos.filter((v) => v.id !== deletingVideo.id));
        setDeletingVideo(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const totalUserSize = videos.reduce((acc, v) => acc + (v.size || 0), 0);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu người dùng & video..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-400">{error || 'Không tìm thấy tài khoản'}</p>
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Về danh sách tài khoản
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/users')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh sách người dùng
        </Button>
      </div>

      {/* Thông tin hồ sơ User */}
      <div className="bg-surface-light border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-700 to-accent text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {profile.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">{profile.email}</h1>
                {profile.role === 'admin' ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40 flex items-center">
                    <Shield className="w-3 h-3 mr-1" /> Admin
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    User
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Thành viên từ: {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <div>
            {profile.is_banned ? (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800/40">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Tài khoản đang bị khóa
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Tài khoản đang hoạt động
              </span>
            )}
          </div>
        </div>

        {/* Thống kê nhanh của user */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-primary-950 text-primary-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng clip highlight</p>
              <p className="text-lg font-bold text-white">{videos.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 text-accent">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Dung lượng sử dụng</p>
              <p className="text-lg font-bold text-white">{formatFileSize(totalUserSize)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách clip highlight của user này */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          Tất cả video highlight của thành viên ({videos.length})
        </h2>

        {videos.length === 0 ? (
          <div className="text-center py-12 bg-surface-light/40 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-sm">
            Thành viên này chưa tải lên video nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <div
                key={v.id}
                className="bg-surface-light border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-primary-300">
                      {v.game}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatFileSize(v.size)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white line-clamp-1">{v.title}</h3>
                  {v.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {v.description}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-2">
                    Tải lên: {formatDate(v.created_at)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/video/${v.id}`)}
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> Xem
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingVideo(v)}
                    className="text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa video
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Xác nhận Admin Xóa Video */}
      <Modal
        isOpen={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        title="Admin: Xác nhận xóa highlight của người dùng"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Bạn đang thực hiện quyền Admin để xóa video{' '}
            <strong className="text-white">"{deletingVideo?.title}"</strong> của tài khoản này.
            File sẽ bị xóa vĩnh viễn khỏi Storage và Database qua Edge Function.
          </p>
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={() => setDeletingVideo(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              onClick={handleConfirmDeleteVideo}
            >
              Xóa ngay
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUserDetail;
