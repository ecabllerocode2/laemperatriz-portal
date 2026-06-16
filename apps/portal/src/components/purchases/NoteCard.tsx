import { ChevronRight, Clock } from "lucide-react";
import type { PortalSaleNote } from "@emperatriz/types";
import { formatCountdown, formatCurrency } from "@/lib/format";

interface NoteCardProps {
  note: PortalSaleNote;
  index: number;
  onOpenItems: () => void;
  onPay: () => void;
}

function statusLabel(note: PortalSaleNote): { text: string; className: string } {
  if (note.status === "paid_early" || note.status === "paid_late") {
    return { text: "Pagada", className: "bg-emerald-100 text-emerald-800" };
  }
  if (note.earlyPayActive) {
    return { text: "Pronto pago", className: "bg-amber-100 text-amber-800" };
  }
  return { text: "Pendiente", className: "bg-neutral-100 text-neutral-700" };
}

export default function NoteCard({ note, index, onOpenItems, onPay }: NoteCardProps) {
  const badge = statusLabel(note);
  const itemCount = note.items.reduce((sum, item) => sum + item.quantity, 0);
  const pending = note.status === "pending_payment";
  const balance = Math.max(0, note.total - note.paidAmount);
  const showEarlyPayBreakdown = pending && note.earlyPayActive && note.discount > 0;

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-neutral-400">Nota #{index + 1}</p>
          {showEarlyPayBreakdown ? (
            <div className="mt-1 space-y-0.5">
              <p className="text-sm text-neutral-400 line-through">
                {formatCurrency(note.subtotal)}
              </p>
              <p className="text-lg font-bold text-brand-night">{formatCurrency(note.total)}</p>
              <p className="text-xs font-medium text-emerald-700">
                Ahorras {formatCurrency(note.discount)} con pronto pago
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg font-bold text-brand-night">{formatCurrency(note.total)}</p>
              {note.discount > 0 ? (
                <p className="text-xs text-emerald-700">
                  Descuento pronto pago: -{formatCurrency(note.discount)}
                </p>
              ) : null}
            </>
          )}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.text}
        </span>
      </div>

      {note.earlyPayEligible && pending && !note.earlyPayTimerStarted ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600">
          <Clock className="h-3.5 w-3.5" />
          Pronto pago disponible al terminar el live
        </div>
      ) : null}

      {note.earlyPayActive && pending ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-800">
          <Clock className="h-3.5 w-3.5" />
          Pronto pago: {formatCountdown(note.earlyPayRemainingMs ?? 0)}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onOpenItems}
        className="mt-3 flex w-full items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 text-left text-sm text-brand-night hover:bg-neutral-100"
      >
        <span>
          {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
        </span>
        <ChevronRight className="h-4 w-4 text-neutral-400" />
      </button>

      {pending && balance > 0 ? (
        <button
          type="button"
          onClick={onPay}
          className="mt-3 w-full rounded-xl bg-brand-night py-3 text-sm font-semibold text-white hover:bg-black"
        >
          Pagar {formatCurrency(balance)}
        </button>
      ) : null}
    </article>
  );
}
