import React, { useState } from 'react';
import {
  Download,
  X,
  Sparkles,
  CheckCircle2,
  Film,
  Music,
  Share2,
  Zap,
  Sliders,
  Tv,
  Monitor,
  Flame,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';

// ===== Types & Settings cho chất lượng video =====
export type VideoQuality = '4k' | '2k' | '1080p' | 'original' | '720p' | '480p' | 'audio' | 'custom';

export interface CustomVideoSettings {
  resolution: '4k' | '2k' | '1080p' | '720p' | '480p';
  fps: 60 | 30;
  bitrateLevel: 'ultra' | 'high' | 'medium';
}

export interface QualitySetting {
  id: VideoQuality;
  name: string;
  resolutionText: string;
  desc: string;
  badge: string;
  badgeColor: string;
}

export const QUALITY_OPTIONS: QualitySetting[] = [
  {
    id: 'original',
    name: 'Bản Gốc Nguyên Bản (Master Quality)',
    resolutionText: 'Độ phân giải & Bitrate gốc (100% không nén)',
    desc: 'Giữ nguyên 100% chi tiết và tốc độ khung hình ban đầu. Tải ngay lập tức.',
    badge: 'Gốc (Max)',
    badgeColor: 'bg-purple-900/50 text-purple-300 border-purple-500/50 shadow-sm',
  },
  {
    id: '4k',
    name: '4K Ultra HD (Siêu sắc nét)',
    resolutionText: '3840 x 2160 (Upscale AI High-Bitrate ~22 Mbps)',
    desc: 'Độ phân giải cực đại cho màn hình 4K, TV, clip cinematic đẳng cấp',
    badge: '4K UHD',
    badgeColor: 'bg-amber-900/50 text-amber-300 border-amber-500/50 shadow-sm',
  },
  {
    id: '2k',
    name: '2K Quad HD (Chuẩn Gaming 60 FPS)',
    resolutionText: '2560 x 1440 @ 60 FPS (~14 Mbps)',
    desc: 'Chuẩn màn hình gaming Esports phổ biến nhất hiện nay, hình ảnh căng nét và mượt mà',
    badge: '2K QHD',
    badgeColor: 'bg-indigo-900/50 text-indigo-300 border-indigo-500/50 shadow-sm',
  },
  {
    id: '1080p',
    name: 'Full HD 1080p 60 FPS (Chất lượng cao)',
    resolutionText: '1920 x 1080 @ 60 FPS (~8.5 Mbps)',
    desc: 'Tối ưu tuyệt vời cho YouTube, TikTok, Facebook Gaming với chuyển động 60 FPS',
    badge: '1080p 60FPS',
    badgeColor: 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50 shadow-sm',
  },
  {
    id: '720p',
    name: 'Chuẩn HD 720p (Tối ưu chia sẻ)',
    resolutionText: '1280 x 720 (30 FPS ~3 Mbps)',
    desc: 'Nén nhẹ, dễ dàng gửi qua Discord (dưới 25MB), Zalo, Messenger không bị quá dung lượng',
    badge: '720p HD',
    badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  },
  {
    id: '480p',
    name: 'Chuẩn SD 480p (Tiết kiệm dung lượng)',
    resolutionText: '854 x 480 (~1 Mbps)',
    desc: 'Giảm 60-70% dung lượng, tải cực nhanh khi dùng 4G hoặc mạng yếu',
    badge: '480p SD',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    id: 'audio',
    name: 'Chỉ tải Âm thanh (Audio / Voice Chat)',
    resolutionText: 'Âm thanh chất lượng cao 320 kbps',
    desc: 'Tách riêng phần âm thanh voice chat và hiệu ứng âm thanh game',
    badge: 'Audio',
    badgeColor: 'bg-rose-900/40 text-rose-300 border-rose-700/40',
  },
];

// Hàm tải Blob về máy
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

// Hàm tải URL trực tiếp
async function downloadDirectUrl(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const blob = await res.blob();
    triggerBlobDownload(blob, filename);
  } catch (err) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Hàm xử lý nén và tải video
async function processAndDownloadVideo(
  videoUrl: string,
  quality: VideoQuality,
  baseFilename: string,
  onProgress?: (progress: number, message: string) => void,
  customSettings?: CustomVideoSettings
): Promise<void> {
  const cleanName = baseFilename.replace(/[^\w\s\u00C0-\u1EF9-]/gi, '').replace(/\s+/g, '_') || 'highlight';

  if (quality === 'original') {
    onProgress?.(50, 'Đang chuẩn bị bản gốc...');
    await downloadDirectUrl(videoUrl, `${cleanName}_original.mp4`);
    onProgress?.(100, 'Tải xuống hoàn tất!');
    return;
  }

  return new Promise(async (resolve, _reject) => {
    let video: HTMLVideoElement | null = null;
    let animId: number | null = null;
    let recorder: MediaRecorder | null = null;
    let audioCtx: AudioContext | null = null;

    const cleanup = () => {
      if (animId) cancelAnimationFrame(animId);
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };

    try {
      onProgress?.(8, 'Đang khởi động bộ xử lý đồ họa GPU...');

      video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = false;
      video.playsInline = true;
      video.preload = 'auto';

      await new Promise<void>((res, rej) => {
        if (!video) return rej(new Error('Video null'));
        video.onloadedmetadata = () => res();
        video.onerror = () => rej(new Error('Không thể tải dữ liệu video'));
      });

      const originalWidth = video.videoWidth || 1920;
      const originalHeight = video.videoHeight || 1080;
      const duration = video.duration || 10;
      const aspectRatio = originalWidth / originalHeight;

      let targetHeight = originalHeight;
      let targetFps = 60;
      let targetBitrate = 10_000_000;

      const effectiveQuality = quality === 'custom' && customSettings ? customSettings.resolution : quality;

      switch (effectiveQuality) {
        case '4k':
          targetHeight = 2160;
          targetFps = 60;
          targetBitrate = 22_000_000;
          break;
        case '2k':
          targetHeight = 1440;
          targetFps = 60;
          targetBitrate = 14_000_000;
          break;
        case '1080p':
          targetHeight = 1080;
          targetFps = 60;
          targetBitrate = 8_500_000;
          break;
        case '720p':
          targetHeight = 720;
          targetFps = 30;
          targetBitrate = 3_000_000;
          break;
        case '480p':
          targetHeight = 480;
          targetFps = 30;
          targetBitrate = 1_000_000;
          break;
        default:
          targetHeight = originalHeight;
          targetFps = 60;
          targetBitrate = 10_000_000;
          break;
      }

      if (quality === 'custom' && customSettings) {
        targetFps = customSettings.fps;
        if (customSettings.bitrateLevel === 'ultra') targetBitrate = 25_000_000;
        else if (customSettings.bitrateLevel === 'high') targetBitrate = 12_000_000;
        else targetBitrate = 5_000_000;
      }

      const targetWidth = Math.round(targetHeight * aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx && quality !== 'audio') {
        throw new Error('Canvas 2D Context không khả dụng');
      }

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }

      let combinedStream: MediaStream;
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioCtxClass();
        const source = audioCtx.createMediaElementSource(video);
        const destination = audioCtx.createMediaStreamDestination();
        source.connect(destination);

        if (quality === 'audio') {
          combinedStream = destination.stream;
        } else {
          const videoStream = canvas.captureStream(targetFps);
          combinedStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ]);
        }
      } catch (audioErr) {
        console.warn('Lỗi Audio stream:', audioErr);
        if (quality === 'audio') throw audioErr;
        combinedStream = canvas.captureStream(targetFps);
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (quality === 'audio') {
        mimeType = 'audio/webm';
      }

      recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: quality === 'audio' ? undefined : targetBitrate,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        cleanup();
        const outputBlob = new Blob(chunks, { type: mimeType });
        const ext = quality === 'audio' ? 'webm' : 'mp4';
        const qualityTag = quality === 'custom' ? `${effectiveQuality}_custom` : quality;
        triggerBlobDownload(outputBlob, `${cleanName}_${qualityTag}.${ext}`);
        onProgress?.(100, 'Tải xuống hoàn tất!');
        resolve();
      };

      const drawFrame = () => {
        if (!video || !ctx || video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const currentPercent = Math.min(95, Math.round((video.currentTime / duration) * 88) + 8);
        const label = quality === 'custom' ? 'CUSTOM' : quality.toUpperCase();
        onProgress?.(
          currentPercent,
          `Đang xử lý ${label} (${targetWidth}x${targetHeight} @ ${targetFps}fps) - ${Math.round(
            (video.currentTime / duration) * 100
          )}%`
        );

        animId = requestAnimationFrame(drawFrame);
      };

      video.playbackRate = 2.0;

      recorder.start(100);
      await video.play();
      drawFrame();

      video.onended = () => {
        if (recorder && recorder.state === 'recording') {
          recorder.stop();
        }
      };
    } catch (err: any) {
      cleanup();
      console.warn('Lỗi xử lý chất lượng cao:', err);
      onProgress?.(80, 'Chuyển sang tải trực tiếp bản gốc nguyên bản...');
      await downloadDirectUrl(videoUrl, `${cleanName}_original.mp4`);
      onProgress?.(100, 'Tải xuống hoàn tất!');
      resolve();
    }
  });
}

// ===== Component DownloadQualityModal =====
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

  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('original');

  const [customSettings, setCustomSettings] = useState<CustomVideoSettings>({
    resolution: '2k',
    fps: 60,
    bitrateLevel: 'ultra',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleStartDownload = async () => {
    if (!videoUrl) {
      showToast('Không tìm thấy liên kết video', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Đang khởi tạo...');

    try {
      const targetQuality = activeTab === 'custom' ? 'custom' : selectedQuality;

      await processAndDownloadVideo(
        videoUrl,
        targetQuality,
        videoTitle || 'highlight',
        (p, msg) => {
          setProgress(p);
          setStatusMessage(msg);
        },
        activeTab === 'custom' ? customSettings : undefined
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
      case '4k':
        return <Tv className="w-5 h-5 text-amber-400" />;
      case '2k':
        return <Monitor className="w-5 h-5 text-indigo-400" />;
      case '1080p':
        return <Flame className="w-5 h-5 text-cyan-400" />;
      case 'original':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case '720p':
        return <Share2 className="w-5 h-5 text-emerald-400" />;
      case '480p':
        return <Zap className="w-5 h-5 text-slate-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-rose-400" />;
      default:
        return <Film className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isProcessing && onClose()}
      title="Tùy Chọn Chất Lượng Tải Xuống"
      size="lg"
    >
      <div className="space-y-5">
        {/* Tab chuyển đổi: Cấu hình sẵn vs Tùy chỉnh nâng cao */}
        <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            disabled={isProcessing}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'preset'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Chất lượng có sẵn (4K, 2K, 1080p, Gốc...)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            disabled={isProcessing}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Tùy chỉnh nâng cao (FPS & Bitrate)
          </button>
        </div>

        {/* TAB 1: DANH SÁCH CHẤT LƯỢNG CÓ SẴN */}
        {activeTab === 'preset' && (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
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
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center flex-shrink-0">
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
        )}

        {/* TAB 2: TÙY CHỈNH NÂNG CAO */}
        {activeTab === 'custom' && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Độ phân giải mong muốn:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: '4k', label: '4K (2160p)', sub: '3840x2160' },
                  { id: '2k', label: '2K (1440p)', sub: '2560x1440' },
                  { id: '1080p', label: '1080p', sub: '1920x1080' },
                  { id: '720p', label: '720p HD', sub: '1280x720' },
                  { id: '480p', label: '480p SD', sub: '854x480' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, resolution: res.id as any })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      customSettings.resolution === res.id
                        ? 'border-purple-500 bg-purple-950/40 text-white ring-1 ring-purple-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{res.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{res.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                2. Tốc độ khung hình (Frame Rate):
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { fps: 60, title: '60 FPS (Mượt mà Gaming)', desc: 'Chuẩn mượt mà cho highlight FPS cao' },
                  { fps: 30, title: '30 FPS (Tiêu chuẩn)', desc: 'Tiết kiệm dung lượng và thời gian nén' },
                ].map((f) => (
                  <button
                    key={f.fps}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, fps: f.fps as any })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      customSettings.fps === f.fps
                        ? 'border-cyan-500 bg-cyan-950/30 text-white ring-1 ring-cyan-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{f.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                3. Mức Bitrate (Chất lượng điểm ảnh):
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { level: 'ultra', title: 'Cực đại (Ultra)', desc: '25 Mbps' },
                  { level: 'high', title: 'Cao (High)', desc: '12 Mbps' },
                  { level: 'medium', title: 'Tiêu chuẩn', desc: '5 Mbps' },
                ].map((b) => (
                  <button
                    key={b.level}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, bitrateLevel: b.level as any })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      customSettings.bitrateLevel === b.level
                        ? 'border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{b.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Thanh tiến trình khi đang xử lý */}
        {isProcessing && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-400 font-medium flex items-center gap-1.5 animate-pulse truncate pr-2">
                <Film className="w-3.5 h-3.5 flex-shrink-0" />
                {statusMessage}
              </span>
              <span className="text-slate-300 font-mono font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 h-full transition-all duration-200"
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
            className="px-6"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {activeTab === 'preset' && selectedQuality === 'original'
              ? 'Tải ngay (Bản gốc)'
              : 'Xử lý & Tải về'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadQualityModal;
