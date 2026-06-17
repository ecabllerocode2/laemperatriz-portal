import type { PortalCycle } from "@emperatriz/types";
import { useDeadlineCountdown } from "@/hooks/useDeadlineCountdown";
import { formatCountdown } from "@/lib/format";

interface CycleTimersProps {
  cycle: PortalCycle;
}

export default function CycleTimers({ cycle }: CycleTimersProps) {
  const awaitingFirstLive = cycle.status === "deposit_confirmed";
  const purchaseMs = useDeadlineCountdown(
    cycle.purchaseWindowEndsAt,
    cycle.status === "active" || (cycle.purchaseWindowRemainingMs ?? 0) > 0,
    cycle.purchaseWindowRemainingMs ?? 0,
  );
  const isActive = cycle.status === "active" || purchaseMs > 0;

  if (!awaitingFirstLive && !(isActive && purchaseMs > 0)) {
    return null;
  }

  return (
    <div>
      {awaitingFirstLive ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Ventana de compra (7 días)
          </p>
          <p className="mt-0.5 text-sm font-medium text-brand-night">
            Inicia al terminar el live de tu primera compra
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Ventana de compra (7 días)
          </p>
          <p className="mt-0.5 text-sm font-bold text-amber-900">{formatCountdown(purchaseMs)}</p>
        </div>
      )}
    </div>
  );
}
