import { X } from "lucide-react";
import type { ShippingTier } from "@emperatriz/types";
import { formatCurrency } from "@/lib/format";

interface ShippingTableModalProps {
  open: boolean;
  onClose: () => void;
  shippingTab: ShippingTier[];
}

function tierRangeLabel(tier: ShippingTier): string {
  const min = tier.minTotal.toLocaleString("es-MX");
  if (tier.maxTotal == null) return `+ $${min}`;
  return `$${min} - $${tier.maxTotal.toLocaleString("es-MX")}`;
}

function tierCostLabel(cost: number): string {
  if (cost <= 0) return "Gratis";
  return formatCurrency(cost);
}

export default function ShippingTableModal({ open, onClose, shippingTab }: ShippingTableModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-table-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="shipping-table-title" className="text-lg font-bold text-brand-night">
              Envío 7 días
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Costo según acumulado en el envío abierto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Acumulado</th>
                <th className="px-4 py-2.5 text-right">Envío</th>
              </tr>
            </thead>
            <tbody>
              {shippingTab.map((tier) => (
                <tr key={`${tier.minTotal}-${tier.maxTotal ?? "max"}`} className="border-t border-neutral-100">
                  <td className="px-4 py-3 text-brand-night">{tierRangeLabel(tier)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-night">
                    {tierCostLabel(tier.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
