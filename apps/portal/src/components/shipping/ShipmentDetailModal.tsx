import { useState } from "react";
import { X } from "lucide-react";
import type { PortalCycle } from "@emperatriz/types";
import { formatCurrency, formatShipmentDate } from "@/lib/format";
import ShippingTableModal from "@/components/shipping/ShippingTableModal";

interface ShipmentDetailModalProps {
  open: boolean;
  cycle: PortalCycle;
  onClose: () => void;
  onPayShipping?: () => void;
}

function statusBadgeClass(tone: string): string {
  switch (tone) {
    case "closing":
      return "bg-amber-100 text-amber-800";
    case "penalty":
      return "bg-red-100 text-red-800";
    case "settled":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-red-50 text-brand-red";
  }
}

function noteLabel(index: number): string {
  return `V-${String(index + 1).padStart(4, "0")}`;
}

function noteStatusBadge(note: PortalCycle["notes"][number]): { text: string; className: string } {
  if (note.status === "paid_early" || note.status === "paid_late") {
    return { text: "Pagada", className: "bg-emerald-100 text-emerald-800" };
  }
  if (note.earlyPayRemainingMs && note.earlyPayRemainingMs > 0) {
    return { text: "Pronto pago", className: "bg-sky-100 text-sky-800" };
  }
  return { text: "Abierta", className: "bg-sky-100 text-sky-800" };
}

export default function ShipmentDetailModal({
  open,
  cycle,
  onClose,
  onPayShipping,
}: ShipmentDetailModalProps) {
  const [showTable, setShowTable] = useState(false);
  const [panel, setPanel] = useState<"table" | "early">("table");

  if (!open || !cycle.shipment) return null;

  const { shipment } = cycle;
  const sortedNotes = [...cycle.notes].sort((a, b) => {
    const aMs = a.createdAt && "toMillis" in a.createdAt ? a.createdAt.toMillis() : 0;
    const bMs = b.createdAt && "toMillis" in b.createdAt ? b.createdAt.toMillis() : 0;
    return aMs - bMs;
  });

  const earlyPayNotes = sortedNotes.filter(
    (n) => n.status === "pending_payment" && n.earlyPayEligible,
  );

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-lg font-bold text-brand-night">
                Envío #{shipment.shipmentNumber}
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                {formatShipmentDate(shipment.openedAtMs)} · Ciclo {shipment.cycleDay}/
                {shipment.cycleDayTotal}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(shipment.statusTone)}`}
              >
                {shipment.statusLabel}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-4 sm:px-5">
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-3 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  Acumulado
                </p>
                <p className="mt-0.5 text-sm font-bold text-brand-night">
                  {formatCurrency(shipment.accumulatedTotal)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  Envío
                </p>
                <p className="mt-0.5 text-sm font-bold text-brand-red">{shipment.shippingLabel}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  Pago
                </p>
                <p className="mt-0.5 text-xs font-semibold text-neutral-700">
                  {shipment.canPayShipping
                    ? "Paga envío pendiente"
                    : shipment.pendingNotesCount > 0
                      ? "Notas por liquidar"
                      : "Sin pendientes"}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPanel("table");
                  setShowTable(true);
                }}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                  panel === "table"
                    ? "border-brand-red bg-red-50 text-brand-red"
                    : "border-neutral-200 text-brand-night hover:bg-neutral-50"
                }`}
              >
                tabla 7 días
              </button>
              <button
                type="button"
                onClick={() => setPanel("early")}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                  panel === "early"
                    ? "border-brand-red bg-red-50 text-brand-red"
                    : "border-neutral-200 text-brand-night hover:bg-neutral-50"
                }`}
              >
                Pronto pago
              </button>
            </div>

            {panel === "early" ? (
              <div className="mt-3 rounded-xl border border-neutral-200 p-3">
                {earlyPayNotes.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No hay notas elegibles para pronto pago en este envío.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {earlyPayNotes.map((note, index) => (
                      <li
                        key={note.id}
                        className="flex items-center justify-between text-sm text-brand-night"
                      >
                        <span>{noteLabel(index)}</span>
                        <span className="font-semibold">{formatCurrency(note.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Compras ({sortedNotes.length})
              </p>
              <div className="mt-2 space-y-2">
                {sortedNotes.length === 0 ? (
                  <p className="rounded-xl bg-neutral-50 px-3 py-4 text-center text-sm text-neutral-500">
                    Aún no hay compras en este ciclo.
                  </p>
                ) : (
                  sortedNotes.map((note, index) => {
                    const badge = noteStatusBadge(note);
                    return (
                      <div
                        key={note.id}
                        className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-brand-night">
                            {noteLabel(index)}
                          </p>
                          <p className="text-sm text-neutral-600">{formatCurrency(note.total)}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.text}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {shipment.canPayShipping && onPayShipping ? (
            <div className="border-t border-neutral-100 p-4 sm:px-5">
              <button
                type="button"
                onClick={onPayShipping}
                className="w-full rounded-xl bg-brand-red py-3.5 text-sm font-semibold text-white"
              >
                Pagar envío {shipment.shippingLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <ShippingTableModal
        open={showTable}
        onClose={() => setShowTable(false)}
        shippingTab={shipment.shippingTab}
      />
    </>
  );
}
