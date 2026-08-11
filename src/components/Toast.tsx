import { useToast } from '@/state/library';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2 px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-28">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-ink-700 bg-ink-850 py-2.5 pl-4 pr-3 shadow-xl animate-slide-up"
          role="status"
          aria-live="polite"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-sonic-500" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span className="text-sm font-medium text-white">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="rounded-full p-0.5 text-ink-400 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
