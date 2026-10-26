import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Film, HardDrive, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatFileSize } from '../../lib/utils';
import { useAdmin } from '../../hooks/useAdmin';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading, error, fetchStats } = useAdmin();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-light border border-slate-700/80 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/50 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Khu vực Quản trị viên (Super Admin)</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bảng Điều Khiển Hệ Thống
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tổng quan tài nguyên, tài khoản người dùng và video highlight toàn trang
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => fetchStats()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Làm mới
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/users')}>
            Quản lý thành viên <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Đang tải dữ liệu thống kê qua Edge Function..." />
        </div>
      ) : (
        /* Thống kê Card */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Users */}
          <div className="bg-surface-light border border-slate-700/80 hover:border-primary-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Tổng tài khoản</span>
              <div className="w-12 h-12 rounded-xl bg-primary-950/60 text-primary-400 border border-primary-800/40 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {stats?.total_users ?? 0}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Người dùng đã đăng ký tài khoản</p>
            </div>
          </div>

          {/* Card 2: Videos */}
          <div className="bg-surface-light border border-slate-700/80 hover:border-accent/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Tổng clip highlight</span>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 text-accent border border-cyan-800/40 flex items-center justify-center">
                <Film className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {stats?.total_videos ?? 0}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Video đang lưu trên hệ thống</p>
            </div>
          </div>

          {/* Card 3: Storage */}
          <div className="bg-surface-light border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Dung lượng Storage</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
                <HardDrive className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white">
                {formatFileSize(stats?.total_storage_bytes ?? 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Dung lượng Supabase Storage đã dùng</p>
            </div>
          </div>
        </div>
      )}

      {/* Hành động nhanh */}
      <div className="bg-surface-light border border-slate-700/80 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Thao tác quản trị</h2>
        <p className="text-sm text-slate-400 mb-4">
          Tất cả hành động nhạy cảm như khóa tài khoản hoặc xóa video của thành viên được thực hiện an toàn qua Supabase Edge Functions sử dụng Service Role Key.
        </p>
        <Button variant="secondary" onClick={() => navigate('/admin/users')}>
          <Users className="w-4 h-4 mr-2" /> Đi tới danh sách quản lý người dùng
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
