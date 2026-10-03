import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({});

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = ++idCounter;
    const item = { id, type: 'info', duration: 4000, ...toast };
    setToasts(prev => [...prev, item]);
    if (item.duration > 0) {
      setTimeout(() => remove(id), item.duration);
    }
    return id;
  }, [remove]);

  const toast = {
    show: push,
    success: (message, title) => push({ type: 'success', message, title }),
    error: (message, title) => push({ type: 'error', message, title, duration: 6000 }),
    info: (message, title) => push({ type: 'info', message, title }),
    warning: (message, title) => push({ type: 'warning', message, title }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

const STYLES = {
  success: { border: 'border-green-500/50', bg: 'bg-green-500/10', dot: 'bg-green-400' },
  error:   { border: 'border-red-500/50',   bg: 'bg-red-500/10',   dot: 'bg-red-400' },
  warning: { border: 'border-amber-500/50', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  info:    { border: 'border-blue-500/50',  bg: 'bg-blue-500/10',  dot: 'bg-blue-400' },
};

function ToastCard({ toast, onDismiss }) {
  const s = STYLES[toast.type] || STYLES.info;
  return (
    <div className={`bg-[#0d1e35] border ${s.border} rounded-lg shadow-2xl overflow-hidden animate-slide-in`}>
      <div className={`flex items-start gap-3 p-3 ${s.bg}`}>
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-xs font-semibold text-white">{toast.title}</p>
          )}
          <p className={`text-xs ${toast.title ? 'text-blue-200 mt-0.5' : 'text-white'}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-blue-400 hover:text-white text-base leading-none flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}