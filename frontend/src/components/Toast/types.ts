export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastMessageOptions {
  id?: string;
  severity?: ToastSeverity;
  summary?: string;
  detail: string;
  life?: number; // duration in ms, default 4000
  sticky?: boolean; // if true, does not auto-dismiss
  closable?: boolean; // default true
}

export interface ToastMessage extends ToastMessageOptions {
  id: string;
  severity: ToastSeverity;
  detail: string;
  life: number;
  sticky: boolean;
  closable: boolean;
  createdAt: number;
}

export interface ToastContextType {
  /**
   * Shows a toast notification using PrimeNG-style options object
   */
  show: (options: ToastMessageOptions) => string;

  /**
   * Flexible toast display supporting either options object or positional arguments
   */
  showToast: (
    optionsOrSeverity: ToastMessageOptions | ToastSeverity,
    detail?: string,
    summary?: string,
    life?: number
  ) => string;

  /**
   * Quick helper for success messages
   */
  showSuccess: (detail: string, summary?: string, life?: number) => string;

  /**
   * Quick helper for error messages
   */
  showError: (detail: string, summary?: string, life?: number) => string;

  /**
   * Quick helper for warning messages
   */
  showWarn: (detail: string, summary?: string, life?: number) => string;

  /**
   * Quick helper for info messages
   */
  showInfo: (detail: string, summary?: string, life?: number) => string;

  /**
   * Backwards-compatible helper matching previous local mostrarToast(tipo, mensagem)
   */
  mostrarToast: (
    tipo: 'success' | 'error' | 'warn' | 'info',
    mensagem: string,
    titulo?: string
  ) => string;

  /**
   * Dismiss a specific toast by its id
   */
  remove: (id: string) => void;

  /**
   * Dismiss all currently visible toasts
   */
  clear: () => void;
}
