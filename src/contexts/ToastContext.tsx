import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { generateId } from '../lib/utils';
import type { Toast, ToastType } from '../types';

/**
 * Interface mô tả các giá trị ToastContext cung cấp
 */
interface ToastContextType {
  /** Danh sách toast đang hiển thị */
  toasts: Toast[];
  /** Hiển thị toast mới */
  showToast: (message: string, type?: ToastType) => void;
  /** Xóa toast theo id */
  removeToast: (id: string) => void;
}

// Giới hạn tối đa số toast hiển thị cùng lúc
const MAX_TOASTS = 5;
// Thời gian tự động ẩn toast (ms)
const AUTO_DISMISS_MS = 5000;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Export context để hook có thể sử dụng
export { ToastContext };

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider - Component cung cấp hệ thống toast notification cho toàn app
 * 
 * Chức năng:
 * - Hiển thị toast ở góc dưới bên phải
 * - Tự động ẩn sau 5 giây
 * - Giới hạn tối đa 5 toast cùng lúc
 * - Hỗ trợ 4 loại: success, error, info, warning
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Lưu trữ timeout IDs để cleanup khi component unmount
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  /**
   * Xóa một toast theo ID
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    // Clear timeout nếu còn đang chạy
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
  }, []);

  /**
   * Hiển thị toast mới
   * Nếu đã đạt giới hạn MAX_TOASTS, xóa toast cũ nhất
   */
  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = generateId();
      const newToast: Toast = { id, message, type };

      setToasts((prev) => {
        // Nếu đã đủ số lượng tối đa, loại bỏ toast cũ nhất
        const updated = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
        return [...updated, newToast];
      });

      // Tự động xóa toast sau AUTO_DISMISS_MS
      const timeout = setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);

      timeoutRefs.current.set(id, timeout);
    },
    [removeToast]
  );

  // Cleanup tất cả timeout khi component unmount
  useEffect(() => {
    const currentTimeouts = timeoutRefs.current;
    return () => {
      currentTimeouts.forEach((timeout) => clearTimeout(timeout));
      currentTimeouts.clear();
    };
  }, []);

  const value: ToastContextType = {
    toasts,
    showToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render toast container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Custom hook để sử dụng toast trong bất kỳ component nào
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng trong ToastProvider');
  }
  return context;
}

/* ============================================================
   TOAST UI COMPONENTS - Render trực tiếp trong provider
   ============================================================ */

/**
 * Lấy màu sắc và icon cho từng loại toast
 */
function getToastStyles(type: ToastType): {
  bgClass: string;
  borderClass: string;
  iconColor: string;
  icon: string;
} {
  switch (type) {
    case 'success':
      return {
        bgClass: 'bg-green-900/90',
        borderClass: 'border-green-500',
        iconColor: 'text-green-400',
        icon: '✓',
      };
    case 'error':
      return {
        bgClass: 'bg-red-900/90',
        borderClass: 'border-red-500',
        iconColor: 'text-red-400',
        icon: '✕',
      };
    case 'warning':
      return {
        bgClass: 'bg-yellow-900/90',
        borderClass: 'border-yellow-500',
        iconColor: 'text-yellow-400',
        icon: '⚠',
      };
    case 'info':
    default:
      return {
        bgClass: 'bg-blue-900/90',
        borderClass: 'border-blue-500',
        iconColor: 'text-blue-400',
        icon: 'ℹ',
      };
  }
}

/**
 * Container chứa tất cả toast - fixed ở góc dưới bên phải
 */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}

/**
 * Component hiển thị một toast đơn lẻ
 * Có animation slide-in từ phải và nút đóng
 */
function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 
        px-4 py-3 
        rounded-lg 
        border-l-4 
        ${styles.bgClass} 
        ${styles.borderClass}
        backdrop-blur-sm
        shadow-lg shadow-black/30
        animate-slide-in-right
        transition-all duration-300
      `}
      role="alert"
    >
      {/* Icon */}
      <span className={`${styles.iconColor} text-lg font-bold flex-shrink-0 mt-0.5`}>
        {styles.icon}
      </span>

      {/* Nội dung toast */}
      <p className="text-gray-100 text-sm flex-1 break-words">
        {toast.message}
      </p>

      {/* Nút đóng */}
      <button
        onClick={() => onClose(toast.id)}
        className="text-gray-400 hover:text-gray-200 flex-shrink-0 ml-2 transition-colors"
        aria-label="Đóng thông báo"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
