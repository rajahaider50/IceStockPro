import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => removeToast(toasts[0].id), 2200);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
    error: <XCircle size={16} className="text-red-500" />,
    info: <Info size={16} className="text-brand-500" />,
  };

  return (
    <div className="fixed top-16 left-1/2 z-[100] flex flex-col gap-2 items-center safe-top">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in bg-gray-900/95 text-white text-[13px] font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-[85vw]"
        >
          {icons[t.type]}
          <span className="truncate">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
