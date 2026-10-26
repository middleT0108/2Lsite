/**
 * Tiện ích hỗ trợ tải video với nhiều mức chất lượng (Original, 720p, 480p, Audio)
 * Sử dụng HTML5 Canvas + Web Audio API + MediaRecorder phía client
 */

export type VideoQuality = 'original' | '1080p' | '720p' | '480p' | 'audio';

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
    name: 'Chất lượng Gốc (Khuyên dùng)',
    resolutionText: 'Độ phân giải gốc (1080p / 2K / 60 FPS)',
    desc: 'Giữ nguyên 100% độ sắc nét ban đầu của clip highlight',
    badge: 'Gốc',
    badgeColor: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  },
  {
    id: '720p',
    name: 'Chuẩn HD 720p (Tối ưu chia sẻ)',
    resolutionText: '1280 x 720 (30 FPS)',
    desc: 'Nén nhẹ, thích hợp gửi qua Discord, Zalo, Messenger không bị quá giới hạn MB',
    badge: '720p HD',
    badgeColor: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',
  },
  {
    id: '480p',
    name: 'Chuẩn SD 480p (Tiết kiệm dung lượng)',
    resolutionText: '854 x 480',
    desc: 'Giảm 60-70% dung lượng, tải cực nhanh khi dùng 4G hoặc mạng yếu',
    badge: '480p SD',
    badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  },
  {
    id: 'audio',
    name: 'Chỉ tải Âm thanh (Audio)',
    resolutionText: 'Âm thanh highlight (Voice chat, Game Sound)',
    desc: 'Tách riêng phần âm thanh của pha highlight',
    badge: 'Audio',
    badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  },
];

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export async function downloadDirectUrl(url: string, filename: string): Promise<void> {
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

export async function processAndDownloadVideo(
  videoUrl: string,
  quality: VideoQuality,
  baseFilename: string,
  onProgress?: (progress: number, message: string) => void
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
      onProgress?.(10, 'Đang chuẩn bị bộ giải mã trình duyệt...');

      video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = false;
      video.playsInline = true;
      video.preload = 'auto';

      await new Promise<void>((res, rej) => {
        if (!video) return rej(new Error('Video null'));
        video.onloadedmetadata = () => res();
        video.onerror = () => rej(new Error('Không thể tải dữ liệu video để nén'));
      });

      const originalWidth = video.videoWidth || 1920;
      const originalHeight = video.videoHeight || 1080;
      const duration = video.duration || 10;

      let targetHeight = originalHeight;
      if (quality === '720p') targetHeight = Math.min(originalHeight, 720);
      else if (quality === '480p') targetHeight = Math.min(originalHeight, 480);

      const aspectRatio = originalWidth / originalHeight;
      const targetWidth = Math.round(targetHeight * aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

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
          const videoStream = canvas.captureStream(30);
          combinedStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ]);
        }
      } catch (audioErr) {
        if (quality === 'audio') throw audioErr;
        combinedStream = canvas.captureStream(30);
      }

      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      if (quality === 'audio') mimeType = 'audio/webm';

      const bitrate = quality === '720p' ? 2_000_000 : 900_000;
      recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: quality === 'audio' ? undefined : bitrate,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        cleanup();
        const outputBlob = new Blob(chunks, { type: mimeType });
        const ext = quality === 'audio' ? 'webm' : 'mp4';
        triggerBlobDownload(outputBlob, `${cleanName}_${quality}.${ext}`);
        onProgress?.(100, 'Tải xuống hoàn tất!');
        resolve();
      };

      const drawFrame = () => {
        if (!video || !ctx || video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const currentPercent = Math.min(95, Math.round((video.currentTime / duration) * 85) + 10);
        onProgress?.(currentPercent, `Đang xử lý ${quality.toUpperCase()} (${Math.round((video.currentTime / duration) * 100)}%)...`);

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
      onProgress?.(80, 'Chuyển sang tải trực tiếp bản gốc...');
      await downloadDirectUrl(videoUrl, `${cleanName}_original.mp4`);
      onProgress?.(100, 'Tải xuống hoàn tất!');
      resolve();
    }
  });
}
