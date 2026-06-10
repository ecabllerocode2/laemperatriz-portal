import { CheckCircle, Wallet } from "lucide-react";
import type { PortalCycle } from "@emperatriz/types";
import ShippingProgressTracker from "@/components/shipping/ShippingProgressTracker";
import { formatCurrency, formatShipmentDate } from "@/lib/format";

interface ShipmentCardProps {
  cycle: PortalCycle;
  onOpenDetail: () => void;
  onPayShipping?: () => void;
  onConfirmFree?: () => void;
  readOnly?: boolean;
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

export default function ShipmentCard({
  cycle,
  onOpenDetail,
  onPayShipping,
  onConfirmFree,
  readOnly = false,
}: ShipmentCardProps) {
  const shipment = cycle.shipment;
  if (!shipment) return null;

  const purchaseLabel =
    shipment.purchaseCount === 1 ? "1 compra" : `${shipment.purchaseCount} compras`;

  const statusText = shipment.canPayShipping
    ? "Pago envío pendiente"
    : shipment.canConfirmFreeShipping
      ? "Confirma tu envío gratis"
      : shipment.pendingNotesCount > 0
        ? "Notas por liquidar en el ciclo"
        : readOnly
          ? "Envío cerrado"
          : "Ciclo en curso — solo consulta";

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-brand-night">
            Envío #{shipment.shipmentNumber}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            {formatShipmentDate(shipment.openedAtMs)}
            {!readOnly ? ` · Día ${shipment.cycleDay}/${shipment.cycleDayTotal}` : ""} ·{" "}
            {purchaseLabel}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(shipment.statusTone)}`}
        >
          {shipment.statusLabel}
        </span>
      </div>

      <div className="mt-3 flex gap-4 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Acum.</p>
          <p className="font-bold text-brand-night">{formatCurrency(shipment.accumulatedTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Envío</p>
          <p className="font-bold text-brand-red">{shipment.shippingLabel}</p>
        </div>
      </div>

      <ShippingProgressTracker steps={shipment.shippingProgress} compact />

      <p className="mt-2 text-xs text-neutral-600">{statusText}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenDetail}
          className="flex-1 rounded-xl border border-brand-red py-2.5 text-sm font-semibold text-brand-red hover:bg-red-50"
        >
          Detalle
        </button>
        {!readOnly && shipment.canConfirmFreeShipping && onConfirmFree ? (
          <button
            type="button"
            onClick={onConfirmFree}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white"
          >
            <CheckCircle className="h-4 w-4" />
            Confirmar
          </button>
        ) : null}
        {!readOnly && shipment.canPayShipping && onPayShipping ? (
          <button
            type="button"
            onClick={onPayShipping}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-red py-2.5 text-sm font-semibold text-white"
          >
            <Wallet className="h-4 w-4" />
            Pagar
          </button>
        ) : !readOnly && !shipment.canConfirmFreeShipping ? (
          <button
            type="button"
            disabled={!shipment.canPayShipping}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-400"
          >
            <Wallet className="h-4 w-4" />
            Pagar
          </button>
        ) : null}
      </div>
    </article>
  );
}
