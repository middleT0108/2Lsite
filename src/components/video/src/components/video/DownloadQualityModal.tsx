import React, { useState } from 'react';
import {
  Download,
  Sparkles,
  CheckCircle2,
  Film,
  Music,
  Share2,
  Zap,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import {
  QUALITY_OPTIONS,
  VideoQuality,
  processAndDownloadVideo,
} from '../../lib/video-transcode';

interface DownloadQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
}

export const DownloadQualityModal: React.FC<DownloadQualityModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoTitle,
}) => {
  const { showToast } = useToast();
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleStartDownload = async () => {
    if (!videoUrl) {
      showToast('Không tìm thấy liên kết video', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setStatusMessage('Đang khởi tạo...');

    try {
      await processAndDownloadVideo(
        videoUrl,
        selectedQuality,
        videoTitle || 'highlight',
        (p, msg) => {
          setProgress(p);
          setStatusMessage(msg);
        }
      );

      showToast('Tải video xuống thành công!', 'success');
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setStatusMessage('');
        onClose();
      }, 700);
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải xuống video lúc này', 'error');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getQualityIcon = (id: VideoQuality) => {
    switch (id) {
      case 'original':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case '720p':
        return <Share2 className="w-5 h-5 text-cyan-400" />;
      case '480p':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-amber-400" />;
      default:
        return <Film className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isProcessing && onClose()}
      title="Tải Xuống Video Highlight"
      size="md"
    >
      <div className="space-y-5">
        <p className="text-xs text-slate-400">
          Chọn độ phân giải phù hợp với nhu cầu lưu trữ hoặc chia sẻ của bạn:
        </p>

        {/* Danh sách các mức chất lượng */}
        <div className="space-y-2.5">
          {QUALITY_OPTIONS.map((opt) => {
            const isSelected = selectedQuality === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => !isProcessing && setSelectedQuality(opt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/25 ring-1 ring-purple-500 shadow-md'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                    {getQualityIcon(opt.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{opt.name}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 ml-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Thanh tiến trình khi đang nén/tải */}
        {isProcessing && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-400 font-medium flex items-center gap-1.5 animate-pulse">
                <Film className="w-3.5 h-3.5" />
                {statusMessage}
              </span>
              <span className="text-slate-300 font-mono font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
          >
            Hủy
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isProcessing}
            onClick={handleStartDownload}
            className="px-5"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {selectedQuality === 'original' ? 'Tải ngay (Bản gốc)' : 'Bắt đầu tải xuống'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadQualityModal;
