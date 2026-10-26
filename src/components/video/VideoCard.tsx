import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Edit2, Trash2, Calendar, HardDrive, Tag } from 'lucide-react';
import { Video } from '../../types';
import { formatDate, formatFileSize } from '../../lib/utils';
import { videoService } from '../../services/video.service';

interface VideoCardProps {
  video: Video;
  onEdit?: (video: Video) => void;
  onDelete?: (video: Video) => void;
  showActions?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  // Lấy signed URL cho ảnh thumbnail
  useEffect(() => {
    let isMounted = true;
    if (video.thumbnail_path) {
      videoService.getSignedThumbnailUrl(video.thumbnail_path).then((url) => {
        if (isMounted && url) {
          setThumbUrl(url);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [video.thumbnail_path]);

  const handleCardClick = () => {
    navigate(`/video/${video.id}`);
  };

  return (
    <div className="group relative bg-surface-light border border-slate-700/60 hover:border-primary-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-950/40 flex flex-col">
      {/* Vùng thumbnail và nút xem video */}
      <div
        onClick={handleCardClick}
        className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer"
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-900 to-slate-800">
            <Play className="w-12 h-12 stroke-[1.5] text-slate-600 mb-1" />
            <span className="text-xs">Chưa có thumbnail</span>
          </div>
        )}

        {/* Nút Play hover overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Badge Tên Game */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-950/80 backdrop-blur-md text-primary-300 border border-primary-500/30">
          {video.game}
        </span>

        {/* Badge Dung lượng */}
        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[11px] font-medium rounded bg-black/75 text-slate-300 backdrop-blur-sm">
          {formatFileSize(video.size)}
        </span>
      </div>

      {/* Thông tin video */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={handleCardClick}
            title={video.title}
            className="font-semibold text-slate-100 line-clamp-1 hover:text-primary-400 cursor-pointer transition-colors"
          >
            {video.title}
          </h3>

          {video.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {video.description}
            </p>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {video.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700"
                >
                  <Tag className="w-2.5 h-2.5 mr-1 text-primary-400" />
                  {tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="text-[10px] text-slate-500 self-center">
                  +{video.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer của card: Ngày upload và Nút thao tác */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(video.created_at)}</span>
          </div>

          {showActions && (
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(video);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-slate-700/60 transition-colors"
                  title="Chỉnh sửa thông tin"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(video);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors"
                  title="Xóa highlight"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
