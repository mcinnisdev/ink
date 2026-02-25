import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useNotificationStore } from "../../stores/notifications";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: "border-green-800/50 bg-green-900/30 text-green-300",
  error: "border-red-800/50 bg-red-900/30 text-red-300",
  info: "border-blue-800/50 bg-blue-900/30 text-blue-300",
};

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-sm shadow-lg animate-in slide-in-from-right ${colors[toast.type]}`}
          >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-xs">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink-500 hover:text-ink-50 flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
