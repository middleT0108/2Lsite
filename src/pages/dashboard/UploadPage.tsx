import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoUploader from '../../components/video/VideoUploader';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Tải clip highlight lên thành công!', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại Dashboard
        </Button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Tải Lên Highlight Mới
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Hệ thống sẽ tự động tạo ảnh thu nhỏ (thumbnail) và lưu trữ bảo mật chỉ riêng bạn xem được
        </p>
      </div>

      <VideoUploader onUploadSuccess={handleSuccess} />
    </div>
  );
};

export default UploadPage;
