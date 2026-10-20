import React from 'react';
import { useToastStore, type ToastItem, type ToastType } from '../../store/toastStore';

const getToastIcon = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
};

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const SingleToast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  return (
    <div
      className={`toast-notification toast-${toast.type}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon">{getToastIcon(toast.type)}</span>
      <div className="toast-message">{toast.message}</div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-stack-container" aria-label="Notifications">
      {toasts.map((item) => (
        <SingleToast key={item.id} toast={item} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
