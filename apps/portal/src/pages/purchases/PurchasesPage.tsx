import { useState } from "react";
import { ArrowDownUp, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { PortalSaleNote } from "@emperatriz/types";
import ValidationBanner from "@/components/cart/ValidationBanner";
import LiveBanner from "@/components/home/LiveBanner";
import CycleTimers from "@/components/purchases/CycleTimers";
import NoteCard from "@/components/purchases/NoteCard";
import NoteItemsModal from "@/components/purchases/NoteItemsModal";
import PenaltyDecisionModal from "@/components/purchases/PenaltyDecisionModal";
import { usePortalCycle } from "@/hooks/usePortalCycle";
import { formatCurrency } from "@/lib/format";
import type { PortalOutletContext } from "@/components/layout/PortalLayout";
import { useUiStore } from "@/stores/ui.store";

interface PortalContext extends PortalOutletContext {}

export default function PurchasesPage() {
  const { depositStatus, canPurchase, privateSnapshot } = useOutletContext<PortalContext>();
  const { cycle, loading, error, reload } = usePortalCycle(true);
  const { openReceiptModal } = useUiStore();
  const [selectedNote, setSelectedNote] = useState<PortalSaleNote | null>(null);
  const [penaltyDismissed, setPenaltyDismissed] = useState(false);

  const cartActive = canPurchase;
  const hasApprovedDeposit = depositStatus === "approved";
  const pendingPenalty =
    cycle?.penalty?.decision === "pending" && cycle.status === "penalty_freq";
  const notes = cycle?.notes ?? [];
  const pendingTotal = notes
    .filter((n) => n.status === "pending_payment")
    .reduce((sum, n) => sum + Math.max(0, n.total - n.paidAmount), 0);

  const handlePayNote = (note: PortalSaleNote) => {
    const balance = Math.max(0, note.total - note.paidAmount);
    openReceiptModal({ purpose: "notes", amount: balance, noteId: note.id });
  };

  const handlePayThreshold = () => {
    const due = privateSnapshot?.thresholdBlock?.depositDue ?? 0;
    if (due <= 0) return;
    openReceiptModal({ purpose: "notes", amount: due });
  };

  return (
    <>
      {depositStatus === "pending" ? <ValidationBanner /> : null}

      {privateSnapshot?.thresholdBlock?.active ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p>
            Has pedido{" "}
            {formatCurrency(privateSnapshot.thresholdBlock.orderedTotal)}. Para seguir apartando,
            liquida{" "}
            {formatCurrency(privateSnapshot.thresholdBlock.depositDue)}.
          </p>
          <button
            type="button"
            onClick={handlePayThreshold}
            className="mt-3 rounded-xl bg-brand-night px-4 py-2.5 text-sm font-semibold text-white"
          >
            Subir comprobante
          </button>
        </section>
      ) : null}

      <LiveBanner cartActive={cartActive} depositStatus={depositStatus} />

      {cycle ? <CycleTimers cycle={cycle} /> : null}

      {pendingPenalty && cycle?.penalty ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 shadow-sm">
          <h3 className="text-sm font-bold text-amber-900">Penalización pendiente</h3>
          <p className="mt-1 text-sm text-amber-900/90">
            Debes revisar y aceptar el ajuste de tu paquete para continuar con el envío.
          </p>
          <button
            type="button"
            onClick={() => setPenaltyDismissed(false)}
            className="mt-3 rounded-xl bg-brand-night px-4 py-2.5 text-sm font-semibold text-white"
          >
            Ver resumen y decidir
          </button>
        </section>
      ) : null}

      <section className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-bold text-brand-night sm:text-lg">Mis compras</h2>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-brand-red">
              {notes.length} {notes.length === 1 ? "nota" : "notas"}
            </span>
            {pendingTotal > 0 ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Por pagar: {formatCurrency(pendingTotal)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-brand-night hover:bg-neutral-50"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              Ordenar
            </button>
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-brand-night hover:bg-neutral-50 disabled:opacity-50"
              aria-label="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-6 text-center text-sm text-brand-red">{error}</p>
        ) : loading && notes.length === 0 ? (
          <p className="mt-6 pb-2 text-center text-sm text-neutral-500">Cargando compras…</p>
        ) : notes.length === 0 ? (
          <p className="mt-6 pb-2 text-center text-sm text-neutral-500 sm:mt-8 sm:pb-4">
            {depositStatus === "pending"
              ? "Tu depósito está en validación. Cuando se apruebe, tus compras aparecerán aquí."
              : hasApprovedDeposit
                ? "Aún no hay notas en tu ciclo actual. Tus compras del live y la tienda aparecerán aquí."
                : "Activa tu carrito con el depósito para poder comprar en el live."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={notes.length - index - 1}
                onOpenItems={() => setSelectedNote(note)}
                onPay={() => handlePayNote(note)}
              />
            ))}
          </div>
        )}
      </section>

      <NoteItemsModal note={selectedNote} onClose={() => setSelectedNote(null)} />

      {pendingPenalty && cycle?.penalty && !penaltyDismissed ? (
        <PenaltyDecisionModal
          penalty={cycle.penalty}
          onClose={() => setPenaltyDismissed(true)}
          onResolved={() => void reload()}
        />
      ) : null}
    </>
  );
}
