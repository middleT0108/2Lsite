import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { VideoFilters as IVideoFilters } from '../../types';

interface VideoFiltersProps {
  games: string[];
  filters: IVideoFilters;
  onFilterChange: (filters: IVideoFilters) => void;
}

export const VideoFilters: React.FC<VideoFiltersProps> = ({
  games,
  filters,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search input để tránh re-render liên tục
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilterChange({ ...filters, search: searchTerm });
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, game: value === 'ALL' ? undefined : value });
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'created_at' | 'title' | 'size';
    onFilterChange({ ...filters, sortBy: value });
  };

  const toggleSortOrder = () => {
    const nextOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({ ...filters, sortOrder: nextOrder });
  };

  return (
    <div className="bg-surface-light border border-slate-700/80 rounded-xl p-4 mb-6 shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tìm kiếm theo tiêu đề */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiêu đề clip..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>

        {/* Lọc theo tựa Game */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filters.game || 'ALL'}
            onChange={handleGameChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Tất cả tựa game</option>
            {games.map((gameName) => (
              <option key={gameName} value={gameName}>
                {gameName}
              </option>
            ))}
          </select>
        </div>

        {/* Sắp xếp theo tiêu chí */}
        <div className="relative">
          <select
            value={filters.sortBy || 'created_at'}
            onChange={handleSortByChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
          >
            <option value="created_at">Sắp xếp: Mới nhất</option>
            <option value="title">Sắp xếp: Tiêu đề A-Z</option>
            <option value="size">Sắp xếp: Dung lượng file</option>
          </select>
        </div>

        {/* Đổi chiều tăng/giảm */}
        <div>
          <button
            type="button"
            onClick={toggleSortOrder}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium text-slate-200 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-primary-400" />
            <span>
              {filters.sortOrder === 'asc' ? 'Thứ tự: Tăng dần' : 'Thứ tự: Giảm dần'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoFilters;
