import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const TOAST_ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_COLORS = {
  success: 'bg-mint/15 border-mint text-espresso',
  info: 'bg-gold/10 border-gold text-espresso',
  warning: 'bg-red-50 border-red-400 text-red-800',
};

const ICON_COLORS = {
  success: 'text-mint-dark',
  info: 'text-gold-dark',
  warning: 'text-red-500',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const addToast = useCallback(
    (message, type = 'success', duration = 3000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-4), { id, message, type, exiting: false }]);
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl border
                shadow-lg backdrop-blur-sm
                ${TOAST_COLORS[toast.type] || TOAST_COLORS.info}
                ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${ICON_COLORS[toast.type]}`} />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
