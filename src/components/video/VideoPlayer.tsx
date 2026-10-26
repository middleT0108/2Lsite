import React, { useRef, useState } from 'react';
import { Download, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import Button from '../ui/Button';

interface VideoPlayerProps {
  src: string;
  poster?: string | null;
  title?: string;
  downloadFilename?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title: _title,
  downloadFilename = 'gameclip.mp4',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Video Viewport */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center group">
        <video
          ref={videoRef}
          src={src}
          poster={poster || undefined}
          controls
          className="w-full h-full object-contain focus:outline-none"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          Trình duyệt của bạn không hỗ trợ định dạng video này.
        </video>
      </div>

      {/* Thanh tác vụ dưới Player */}
      <div className="p-4 bg-surface-light border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="text-slate-300 hover:text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-1.5 text-primary-400" /> : <Play className="w-4 h-4 mr-1.5 text-primary-400" />}
            {isPlaying ? 'Tạm dừng' : 'Phát'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-slate-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="text-slate-300 hover:text-white hidden sm:inline-flex"
          >
            <Maximize className="w-4 h-4 mr-1.5" />
            Toàn màn hình
          </Button>
        </div>

        {/* Nút Tải xuống có signed URL an toàn */}
        <div>
          <a
            href={src}
            download={downloadFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors shadow-md shadow-primary-900/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Tải video xuống
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
