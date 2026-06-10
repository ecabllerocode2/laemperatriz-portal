import type { PortalCycle } from "@emperatriz/types";
import { formatCountdown } from "@/lib/format";

interface CycleTimersProps {
  cycle: PortalCycle;
}

export default function CycleTimers({ cycle }: CycleTimersProps) {
  const purchaseMs = cycle.purchaseWindowRemainingMs ?? 0;
  const settlementMs = cycle.settlementRemainingMs ?? 0;
  const awaitingFirstLive = cycle.status === "deposit_confirmed";
  const isActive = cycle.status === "active" || (cycle.purchaseWindowRemainingMs ?? 0) > 0;
  const isClosing =
    cycle.status === "closing_new" ||
    cycle.status === "closing_freq" ||
    cycle.status === "penalty_new";

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {awaitingFirstLive ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Ventana de compra (7 días)
          </p>
          <p className="mt-0.5 text-sm font-medium text-brand-night">
            Inicia al terminar el live de tu primera compra
          </p>
        </div>
      ) : null}

      {isActive && purchaseMs > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Ventana de compra (7 días)
          </p>
          <p className="mt-0.5 text-sm font-bold text-amber-900">{formatCountdown(purchaseMs)}</p>
        </div>
      ) : null}

      {isClosing && settlementMs > 0 ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-800">
            Plazo para liquidar envío
          </p>
          <p className="mt-0.5 text-sm font-bold text-sky-900">{formatCountdown(settlementMs)}</p>
        </div>
      ) : null}

      {cycle.shippingCost > 0 && isClosing ? (
        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Costo de envío estimado
          </p>
          <p className="mt-0.5 text-sm font-bold text-brand-night">
            ${cycle.shippingCost.toLocaleString("es-MX")}
            {cycle.freeShippingEarned ? " · Envío gratis" : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
