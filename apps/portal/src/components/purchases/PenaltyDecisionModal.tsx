import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { PortalPenaltySummary } from "@emperatriz/types";
import { acceptPenalty, rejectPenalty } from "@/lib/portal-cycle";
import { formatCurrency } from "@/lib/format";
import { useUiStore } from "@/stores/ui.store";

interface PenaltyDecisionModalProps {
  penalty: PortalPenaltySummary;
  onClose: () => void;
  onResolved: () => void;
}

export default function PenaltyDecisionModal({
  penalty,
  onClose,
  onResolved,
}: PenaltyDecisionModalProps) {
  const [submitting, setSubmitting] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { bumpProfileReload, openShippingAddressModal } = useUiStore();

  const handleAccept = async () => {
    setSubmitting("accept");
    setError(null);
    try {
      await acceptPenalty();
      bumpProfileReload();
      openShippingAddressModal();
      onResolved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo aceptar la penalización.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    setSubmitting("reject");
    setError(null);
    try {
      await rejectPenalty();
      bumpProfileReload();
      onResolved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo rechazar la penalización.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="modal-sheet animate-sheet-up relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl sm:rounded-3xl sm:px-6 sm:pb-6 sm:pt-8">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting !== null}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-2xl text-brand-night">Penalización por liquidación tardía</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Por no liquidar a tiempo, se ajusta tu paquete: conservamos la mercancía más antigua
          (hasta {formatCurrency(penalty.keepBudget)}) y se devuelve al inventario el resto.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase text-emerald-800">Te enviamos</p>
            <p className="text-lg font-bold text-brand-night">{formatCurrency(penalty.adjustedTotal)}</p>
          </div>
          <div className="rounded-xl bg-red-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase text-brand-red">Se quita</p>
            <p className="text-lg font-bold text-brand-red">{formatCurrency(penalty.removedValue)}</p>
          </div>
        </div>

        {penalty.keptItems.length > 0 ? (
          <section className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Recibirás
            </p>
            <ul className="mt-2 space-y-2">
              {penalty.keptItems.map((item, index) => (
                <li key={`${item.noteId}-${item.productId}-${index}`} className="rounded-xl bg-neutral-50 px-3 py-2 text-sm">
                  <span className="font-medium text-brand-night">{item.name}</span>
                  <span className="text-neutral-500">
                    {" "}
                    · {item.quantity} pz · {formatCurrency(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {penalty.returnedItems.length > 0 ? (
          <section className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Se devuelve a inventario
            </p>
            <ul className="mt-2 space-y-2">
              {penalty.returnedItems.map((item, index) => (
                <li key={`${item.noteId}-${item.productId}-${index}`} className="rounded-xl bg-red-50/60 px-3 py-2 text-sm">
                  <span className="font-medium text-brand-night">{item.name}</span>
                  <span className="text-neutral-500">
                    {" "}
                    · {item.quantity} pz · {formatCurrency(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {error ? <p className="mt-4 text-sm text-brand-red">{error}</p> : null}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => void handleAccept()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-night py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Acepto la penalización
          </button>
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => void handleReject()}
            className="w-full rounded-full border border-brand-red py-3.5 text-sm font-semibold text-brand-red disabled:opacity-50"
          >
            {submitting === "reject" ? "Procesando…" : "No acepto, devolver todo"}
          </button>
        </div>
      </div>
    </div>
  );
}
