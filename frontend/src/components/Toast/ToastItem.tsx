import React, { useEffect, useRef, useState } from 'react';
import { ToastMessage } from './types';

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const remainingRef = useRef<number>(toast.life);
  const timerStartRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = () => {
    setIsExiting(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTimeout(() => {
      onRemove(toast.id);
    }, 260);
  };

  const handleMouseEnter = () => {
    if (toast.sticky || isExiting) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const elapsed = Date.now() - timerStartRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (toast.sticky || isExiting) return;
    setIsPaused(false);
    timerStartRef.current = Date.now();
    timeoutRef.current = setTimeout(handleDismiss, remainingRef.current);
  };

  useEffect(() => {
    if (toast.sticky || toast.life <= 0) return;

    timerStartRef.current = Date.now();
    timeoutRef.current = setTimeout(handleDismiss, toast.life);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.id, toast.life, toast.sticky]);

  const getDefaultSummary = () => {
    switch (toast.severity) {
      case 'success':
        return 'Sucesso';
      case 'info':
        return 'Informação';
      case 'warn':
        return 'Atenção';
      case 'error':
        return 'Erro';
      default:
        return '';
    }
  };

  const renderIcon = () => {
    switch (toast.severity) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'info':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      case 'warn':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return null;
    }
  };

  const summaryText = toast.summary !== undefined ? toast.summary : getDefaultSummary();

  return (
    <div
      className={`toast-item toast-severity-${toast.severity} ${isExiting ? 'toast-exiting' : ''}`}
      role="alert"
      aria-atomic="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-icon-wrapper" aria-hidden="true">
        {renderIcon()}
      </div>

      <div className="toast-text-content">
        {summaryText && <div className="toast-summary">{summaryText}</div>}
        <div className="toast-detail">{toast.detail}</div>
      </div>

      {toast.closable && (
        <button
          type="button"
          className="toast-close-btn"
          onClick={handleDismiss}
          aria-label="Fechar notificação"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {!toast.sticky && toast.life > 0 && (
        <div className="toast-progress-track" aria-hidden="true">
          <div
            className="toast-progress-fill"
            style={{
              animationDuration: `${toast.life}ms`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};
