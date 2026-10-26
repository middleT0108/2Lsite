import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { classNames } from '../../lib/utils';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  /** Trạng thái hiển thị modal */
  isOpen: boolean;
  /** Callback khi đóng modal */
  onClose: () => void;
  /** Tiêu đề modal */
  title?: string;
  /** Kích thước modal */
  size?: ModalSize;
  /** Nội dung bên trong modal */
  children: React.ReactNode;
}

// Max-width cho từng kích thước
const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Modal dialog component
 * Render qua Portal vào document.body
 * Hỗ trợ ESC key, click backdrop để đóng
 * Animation fade-in + scale
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
}) => {
  // Xử lý phím ESC để đóng modal
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Thêm event listener khi modal mở
      document.addEventListener('keydown', handleKeyDown);
      // Ngăn scroll body khi modal mở
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Không render nếu modal đóng
  if (!isOpen) return null;

  // Click backdrop để đóng (chỉ khi click chính xác vào backdrop)
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={classNames(
        // Backdrop - dark với blur
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-black/60 backdrop-blur-sm',
        // Animation fade-in
        'animate-in fade-in duration-200'
      )}
      onClick={handleBackdropClick}
    >
      {/* Modal container */}
      <div
        className={classNames(
          'relative w-full mx-4',
          sizeClasses[size],
          // Background và border
          'bg-slate-800 border border-slate-700',
          'rounded-xl shadow-2xl shadow-black/40',
          // Animation scale
          'animate-in zoom-in-95 duration-200'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header với title và nút đóng */}
        {(title || true) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-white"
              >
                {title}
              </h2>
            )}
            {/* Nút đóng (X) ở góc phải */}
            <button
              onClick={onClose}
              className={classNames(
                'p-1.5 rounded-lg',
                'text-slate-400 hover:text-white',
                'hover:bg-slate-700',
                'transition-colors duration-150',
                !title && 'ml-auto'
              )}
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Nội dung modal */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
