import type { PortalSaleNote } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface NoteTotalBreakdownProps {
  note: PortalSaleNote;
  /** Si false, solo muestra el total final (p. ej. nota ya pagada). */
  showDiscount?: boolean;
  className?: string;
}

export default function NoteTotalBreakdown({
  note,
  showDiscount = true,
  className = "",
}: NoteTotalBreakdownProps) {
  const hasDiscount = showDiscount && note.discount > 0;

  if (!hasDiscount) {
    return (
      <p className={`text-lg font-bold text-brand-night ${className}`.trim()}>
        {formatCurrency(note.total)}
      </p>
    );
  }

  const savingsLabel =
    note.earlyPayActive || note.earlyPayEligible
      ? `Ahorras ${formatCurrency(note.discount)} con pronto pago`
      : `Ahorras ${formatCurrency(note.discount)}`;

  return (
    <div className={`space-y-0.5 ${className}`.trim()}>
      <p className="text-sm text-neutral-400 line-through">{formatCurrency(note.subtotal)}</p>
      <p className="text-lg font-bold text-brand-night">{formatCurrency(note.total)}</p>
      <p className="text-xs font-medium text-emerald-700">{savingsLabel}</p>
    </div>
  );
}
