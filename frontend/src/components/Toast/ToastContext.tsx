import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ToastContextType, ToastMessage, ToastMessageOptions, ToastSeverity } from './types';
import { ToastContainer } from './ToastContainer';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;
const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast-${Date.now()}-${toastIdCounter}`;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback((options: ToastMessageOptions): string => {
    const id = options.id || generateToastId();
    const newToast: ToastMessage = {
      id,
      severity: options.severity || 'info',
      summary: options.summary,
      detail: options.detail,
      life: options.life !== undefined ? options.life : 4000,
      sticky: !!options.sticky,
      closable: options.closable !== undefined ? options.closable : true,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      // Máximo de 6 toasts visíveis simultaneamente para manter a interface organizada
      const filtered = prev.length >= 6 ? prev.slice(prev.length - 5) : prev;
      return [...filtered, newToast];
    });

    return id;
  }, []);

  const showToast = useCallback(
    (
      optionsOrSeverity: ToastMessageOptions | ToastSeverity,
      detail?: string,
      summary?: string,
      life?: number
    ): string => {
      if (typeof optionsOrSeverity === 'object') {
        return show(optionsOrSeverity);
      }

      return show({
        severity: optionsOrSeverity,
        detail: detail || '',
        summary,
        life,
      });
    },
    [show]
  );

  const showSuccess = useCallback(
    (detail: string, summary?: string, life?: number) =>
      show({ severity: 'success', detail, summary, life }),
    [show]
  );

  const showError = useCallback(
    (detail: string, summary?: string, life?: number) =>
      show({ severity: 'error', detail, summary, life }),
    [show]
  );

  const showWarn = useCallback(
    (detail: string, summary?: string, life?: number) =>
      show({ severity: 'warn', detail, summary, life }),
    [show]
  );

  const showInfo = useCallback(
    (detail: string, summary?: string, life?: number) =>
      show({ severity: 'info', detail, summary, life }),
    [show]
  );

  const mostrarToast = useCallback(
    (tipo: 'success' | 'error' | 'warn' | 'info', mensagem: string, titulo?: string) =>
      show({ severity: tipo, detail: mensagem, summary: titulo }),
    [show]
  );

  const contextValue = useMemo<ToastContextType>(
    () => ({
      show,
      showToast,
      showSuccess,
      showError,
      showWarn,
      showInfo,
      mostrarToast,
      remove,
      clear,
    }),
    [show, showToast, showSuccess, showError, showWarn, showInfo, mostrarToast, remove, clear]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
};
