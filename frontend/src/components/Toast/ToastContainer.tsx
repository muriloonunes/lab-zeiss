import React from 'react';
import { createPortal } from 'react-dom';
import { ToastMessage } from './types';
import { ToastItem } from './ToastItem';
import './Toast.scss';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (typeof document === 'undefined' || toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className="toast-overlay-container"
      role="region"
      aria-label="Notificações do sistema"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
};
