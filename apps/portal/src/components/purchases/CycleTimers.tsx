import type { PortalCycle } from "@emperatriz/types";
import { useDeadlineCountdown } from "@/hooks/useDeadlineCountdown";
import { formatCountdown } from "@/lib/format";

interface CycleTimersProps {
  cycle: PortalCycle;
}

export default function CycleTimers({ cycle }: CycleTimersProps) {
  const awaitingFirstLive = cycle.status === "deposit_confirmed";
  const isPurchaseActive = cycle.status === "active";
  const isSettlementPhase =
    cycle.status === "closing_new" || cycle.status === "closing_freq";

  const purchaseMs = useDeadlineCountdown(
    cycle.purchaseWindowEndsAt,
    isPurchaseActive,
    cycle.purchaseWindowRemainingMs ?? 0,
  );

  const settlementMs = useDeadlineCountdown(
    cycle.settlementDueAt,
    isSettlementPhase,
    cycle.settlementRemainingMs ?? 0,
  );

  if (awaitingFirstLive) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          Ventana de compra (7 días)
        </p>
        <p className="mt-0.5 text-sm font-medium text-brand-night">
          Inicia al terminar el live de tu primera compra
        </p>
      </div>
    );
  }

  if (isPurchaseActive && purchaseMs > 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
          Ventana de compra (7 días)
        </p>
        <p className="mt-0.5 text-sm font-bold text-amber-900">{formatCountdown(purchaseMs)}</p>
      </div>
    );
  }

  if (isSettlementPhase && settlementMs > 0) {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-800">
          Plazo para liquidar
        </p>
        <p className="mt-0.5 text-sm font-bold text-sky-900">{formatCountdown(settlementMs)}</p>
        <p className="mt-1 text-xs text-sky-700">
          Liquida tus notas y confirma el envío antes de que venza el plazo.
        </p>
      </div>
    );
  }

  return null;
}
