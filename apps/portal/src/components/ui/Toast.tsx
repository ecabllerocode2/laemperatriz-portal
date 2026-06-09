import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { useUiStore } from "@/stores/ui.store";

export default function Toast() {
  const { toast, setToast } = useUiStore();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div className="animate-toast-in fixed left-4 right-4 top-4 z-[60] mx-auto max-w-lg">
      <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-lg">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2} />
        <p className="flex-1 text-sm leading-snug text-brand-night">{toast}</p>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
