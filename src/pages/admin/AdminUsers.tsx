import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, ArrowLeft, Eye, Lock, Unlock, Search, Film, HardDrive } from 'lucide-react';
import { UserWithStats } from '../../types';
import { formatDate, formatFileSize } from '../../lib/utils';
import { useAdmin } from '../../hooks/useAdmin';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { users, loading, error, fetchUsers, toggleBan } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers(1, 100);
  }, [fetchUsers]);

  const handleOpenBanModal = (u: UserWithStats) => {
    setSelectedUser(u);
    setIsBanModalOpen(true);
  };

  const handleConfirmToggleBan = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const nextStatus = !selectedUser.is_banned;
      const success = await toggleBan(selectedUser.id, nextStatus);
      if (success) {
        showToast(
          nextStatus ? 'Đã khóa tài khoản thành công' : 'Đã mở khóa tài khoản thành công',
          'success'
        );
        setIsBanModalOpen(false);
        setSelectedUser(null);
      } else {
        showToast('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Lọc theo search email
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="text-slate-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Về Admin Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Quản Lý Tài Khoản Thành Viên
          </h1>
          <p className="text-sm text-slate-400">
            Xem danh sách, kiểm tra video và khóa/mở khóa tài khoản người dùng
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo email..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Đang tải danh sách người dùng..." />
        </div>
      ) : (
        /* Bảng danh sách thành viên */
        <div className="bg-surface-light border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Tài khoản (Email)</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Số Video</th>
                  <th className="px-6 py-4">Dung lượng</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                        <span>{u.email}</span>
                      </td>

                      <td className="px-6 py-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">
                            <Shield className="w-3 h-3 mr-1" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            User
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {u.is_banned ? (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/40">
                            <ShieldAlert className="w-3 h-3 mr-1" /> Đã bị khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                            Hoạt động
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-primary-400" />
                          {u.video_count || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-accent" />
                          {formatFileSize(u.total_size || 0)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {formatDate(u.created_at)}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          title="Xem chi tiết video của user"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Chi tiết
                        </Button>

                        {/* Không cho tự khóa chính mình */}
                        {u.role !== 'admin' && (
                          <Button
                            variant={u.is_banned ? 'primary' : 'danger'}
                            size="sm"
                            onClick={() => handleOpenBanModal(u)}
                            title={u.is_banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {u.is_banned ? (
                              <>
                                <Unlock className="w-4 h-4 mr-1" /> Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 mr-1" /> Khóa
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Khóa / Mở Khóa */}
      <Modal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        title={selectedUser?.is_banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản người dùng'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Bạn có chắc chắn muốn {selectedUser?.is_banned ? 'mở khóa' : 'khóa'} tài khoản{' '}
            <strong className="text-white">{selectedUser?.email}</strong>?
          </p>
          {!selectedUser?.is_banned && (
            <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-800/40">
              Khi bị khóa, người dùng sẽ không thể đăng nhập hoặc tải lên highlight mới vào hệ thống.
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={() => setIsBanModalOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              variant={selectedUser?.is_banned ? 'primary' : 'danger'}
              loading={isProcessing}
              onClick={handleConfirmToggleBan}
            >
              {selectedUser?.is_banned ? 'Mở khóa ngay' : 'Khóa tài khoản'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
